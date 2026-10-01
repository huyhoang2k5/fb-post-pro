import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enqueuePostJob } from "@/lib/queue";

// GET /api/posts - Danh sách bài đăng
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          product: true,
          campaign: true,
          postMedias: {
            include: { media: true },
            orderBy: { order: "asc" },
          },
          jobs: {
            include: {
              destination: true,
            },
          },
          schedules: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Bổ sung thống kê tiến độ từng bài viết
    const formatted = posts.map((post) => {
      const jobsCount = post.jobs.length;
      const publishedCount = post.jobs.filter((j) => j.status === "PUBLISHED").length;
      const failedCount = post.jobs.filter((j) => j.status === "FAILED").length;
      const manualCount = post.jobs.filter((j) => j.status === "MANUAL_ACTION_REQUIRED").length;
      const pendingCount = post.jobs.filter((j) => j.status === "PENDING" || j.status === "PROCESSING").length;

      const progressPercent = jobsCount > 0 ? Math.round(((publishedCount + manualCount) / jobsCount) * 100) : 0;

      return {
        ...post,
        stats: {
          totalJobs: jobsCount,
          published: publishedCount,
          failed: failedCount,
          manualRequired: manualCount,
          pending: pendingCount,
          progressPercent,
        },
      };
    });

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi lấy danh sách bài đăng" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Tạo bài viết mới & sinh jobs đăng bài riêng biệt cho từng nơi
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      content,
      imageUrls = [],
      productId,
      campaignId,
      linkUrl,
      contactInfo,
      destinationIds = [],
      isScheduled = false,
      scheduledAt,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập tiêu đề bài viết" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập nội dung bài viết" }, { status: 400 });
    }
    if (!destinationIds || destinationIds.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng chọn ít nhất một Trang hoặc Nhóm để đăng bài" },
        { status: 400 }
      );
    }

    const scheduledDate = isScheduled && scheduledAt ? new Date(scheduledAt) : null;
    const initialStatus = isScheduled ? "SCHEDULED" : "PUBLISHING";

    // 1. Tạo bản ghi Post
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        productId: productId || null,
        campaignId: campaignId || null,
        linkUrl: linkUrl ? linkUrl.trim() : null,
        contactInfo: contactInfo ? contactInfo.trim() : null,
        status: initialStatus,
        scheduledAt: scheduledDate,
      },
    });

    // 2. Liên kết hình ảnh (Media / PostMedia)
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (typeof url === "string" && url.trim()) {
          // Tìm hoặc tạo Media record
          let media = await prisma.media.findFirst({
            where: { userId: user.id, fileUrl: url.trim() },
          });

          if (!media) {
            media = await prisma.media.create({
              data: {
                userId: user.id,
                name: `Ảnh bài viết ${i + 1}`,
                fileUrl: url.trim(),
                fileType: "image/jpeg",
              },
            });
          }

          await prisma.postMedia.create({
            data: {
              postId: post.id,
              mediaId: media.id,
              order: i,
            },
          });
        }
      }
    }

    // 3. Nếu đặt lịch, tạo bản ghi Schedule
    if (isScheduled && scheduledDate) {
      await prisma.schedule.create({
        data: {
          postId: post.id,
          scheduledTime: scheduledDate,
          timezone: "Asia/Ho_Chi_Minh",
          status: "PENDING",
        },
      });
    }

    // 4. Tạo các PostJob riêng biệt cho từng Destination được chọn
    // (Nếu chọn 20 nơi đăng -> tạo 20 job riêng để theo dõi trạng thái)
    const createdJobs = [];
    for (let index = 0; index < destinationIds.length; index++) {
      const destId = destinationIds[index];
      const job = await prisma.postJob.create({
        data: {
          postId: post.id,
          destinationId: destId,
          status: "PENDING",
        },
      });

      // Tạo bản ghi log khởi tạo cho job
      await prisma.postJobLog.create({
        data: {
          postJobId: job.id,
          level: "INFO",
          message: `Khởi tạo hàng đợi đăng bài (Job #${index + 1}/${destinationIds.length})`,
        },
      });

      createdJobs.push(job);

      // Nếu đăng ngay lập tức (không đặt lịch tương lai), đẩy vào hàng đợi
      if (!isScheduled) {
        // Tách giãn cách 2.5 giây giữa các job để bảo vệ tài khoản tránh spam rate-limit
        const delayMs = index * 2500;
        await enqueuePostJob(job.id, delayMs);
      }
    }

    // Ghi AuditLog
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "POST_CREATED",
        entityType: "Post",
        entityId: post.id,
        details: `Tạo bài đăng "${post.title}" tới ${destinationIds.length} đích đến (${isScheduled ? `Lên lịch lúc ${scheduledDate}` : "Đăng ngay"}).`,
      },
    });

    return NextResponse.json({
      success: true,
      data: post,
      jobsCount: createdJobs.length,
      message: `Đã tạo bài đăng và ${createdJobs.length} tiến trình (jobs) tương ứng.`,
    });
  } catch (err: any) {
    console.error("Lỗi tạo bài đăng:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi tạo bài đăng" },
      { status: 500 }
    );
  }
}
