import prisma from "./prisma";
import { executeFacebookPublish } from "./facebook";

export interface ProcessJobOptions {
  jobId: string;
}

/**
 * Thêm 1 bản ghi PostJobLog
 */
export async function addJobLog(
  postJobId: string,
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS",
  message: string,
  details?: any
) {
  try {
    await prisma.postJobLog.create({
      data: {
        postJobId,
        level,
        message,
        details: details ? (typeof details === "string" ? details : JSON.stringify(details, null, 2)) : null,
      },
    });
  } catch (err) {
    console.error("Lỗi ghi log PostJobLog:", err);
  }
}

/**
 * Xử lý 1 PostJob cụ thể
 */
export async function executeSingleJob(jobId: string): Promise<{ success: boolean; status: string }> {
  // Lấy thông tin job kèm Post, Destination và FacebookConnection
  const job = await prisma.postJob.findUnique({
    where: { id: jobId },
    include: {
      post: {
        include: {
          postMedias: {
            include: {
              media: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      destination: {
        include: {
          connection: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error(`Không tìm thấy PostJob ID: ${jobId}`);
  }

  // Nếu job đã bị hủy hoặc đã hoàn thành, bỏ qua
  if (job.status === "CANCELLED" || job.status === "PUBLISHED") {
    return { success: true, status: job.status };
  }

  // Cập nhật trạng thái PROCESSING
  await prisma.postJob.update({
    where: { id: jobId },
    data: {
      status: "PROCESSING",
      startedAt: new Date(),
      retryCount: { increment: 1 },
    },
  });

  await addJobLog(
    jobId,
    "INFO",
    `Bắt đầu xử lý đăng bài tới: ${job.destination.name} (${job.destination.type}) [ID: ${job.destination.platformId}]`
  );

  const imageUrls = job.post.postMedias.map((pm) => pm.media.fileUrl);

  await addJobLog(jobId, "INFO", `Chuẩn bị nội dung: ${job.post.title}`, {
    imageCount: imageUrls.length,
    destinationType: job.destination.type,
    platformId: job.destination.platformId,
  });

  try {
    const publishResult = await executeFacebookPublish({
      destinationId: job.destination.platformId,
      destinationType: job.destination.type as "PAGE" | "GROUP",
      pageAccessToken: job.destination.pageAccessToken,
      userAccessToken: job.destination.connection.accessToken,
      content: job.post.content,
      linkUrl: job.post.linkUrl,
      contactInfo: job.post.contactInfo,
      imageUrls,
    });

    if (publishResult.status === "PUBLISHED") {
      await prisma.postJob.update({
        where: { id: jobId },
        data: {
          status: "PUBLISHED",
          fbPostId: publishResult.fbPostId,
          completedAt: new Date(),
          errorMessage: null,
        },
      });

      await addJobLog(
        jobId,
        "SUCCESS",
        `Đăng bài thành công lên Facebook! ID bài viết: ${publishResult.fbPostId}`,
        publishResult.rawResponse
      );

      await updateParentPostStatus(job.postId);
      return { success: true, status: "PUBLISHED" };
    }

    if (publishResult.status === "MANUAL_ACTION_REQUIRED") {
      await prisma.postJob.update({
        where: { id: jobId },
        data: {
          status: "MANUAL_ACTION_REQUIRED",
          errorMessage: publishResult.errorMessage || "Group này không hỗ trợ đăng tự động bằng API hiện tại.",
          completedAt: new Date(),
        },
      });

      await addJobLog(
        jobId,
        "WARN",
        publishResult.errorMessage || "Group này không hỗ trợ đăng tự động bằng API hiện tại.",
        publishResult.rawResponse
      );

      await updateParentPostStatus(job.postId);
      return { success: false, status: "MANUAL_ACTION_REQUIRED" };
    }

    // FAILED
    await prisma.postJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: publishResult.errorMessage || "Đăng bài thất bại từ Meta API",
        completedAt: new Date(),
      },
    });

    await addJobLog(
      jobId,
      "ERROR",
      `Đăng bài thất bại: ${publishResult.errorMessage}`,
      publishResult.rawResponse
    );

    await updateParentPostStatus(job.postId);
    return { success: false, status: "FAILED" };
  } catch (err: any) {
    const errorMsg = err.message || "Lỗi hệ thống khi đăng bài";

    await prisma.postJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        errorMessage: errorMsg,
        completedAt: new Date(),
      },
    });

    await addJobLog(jobId, "ERROR", `Lỗi ngoại lệ: ${errorMsg}`, { stack: err.stack });
    await updateParentPostStatus(job.postId);
    return { success: false, status: "FAILED" };
  }
}

/**
 * Cập nhật trạng thái tổng thể của bài viết mẹ (Post) dựa trên tất cả jobs con
 */
export async function updateParentPostStatus(postId: string) {
  try {
    const allJobs = await prisma.postJob.findMany({
      where: { postId },
      select: { status: true },
    });

    if (allJobs.length === 0) return;

    const hasPending = allJobs.some((j) => j.status === "PENDING" || j.status === "PROCESSING");
    const hasPublished = allJobs.some((j) => j.status === "PUBLISHED");
    const hasFailed = allJobs.some((j) => j.status === "FAILED");
    const hasManual = allJobs.some((j) => j.status === "MANUAL_ACTION_REQUIRED");

    let newStatus = "PUBLISHING";

    if (!hasPending) {
      if (hasPublished && !hasFailed && !hasManual) {
        newStatus = "COMPLETED";
      } else if (hasPublished && (hasFailed || hasManual)) {
        newStatus = "PARTIALLY_FAILED";
      } else if (!hasPublished && (hasFailed || hasManual)) {
        newStatus = "FAILED";
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: newStatus,
        publishedAt: newStatus === "COMPLETED" ? new Date() : undefined,
      },
    });
  } catch (err) {
    console.error("Lỗi updateParentPostStatus:", err);
  }
}

/**
 * Quét và xử lý tất cả các jobs PENDING (dùng cho In-process worker / Cron)
 */
export async function processAllPendingJobs(batchSize = 10): Promise<{ processed: number; errors: number }> {
  const pendingJobs = await prisma.postJob.findMany({
    where: {
      status: "PENDING",
      post: {
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } },
        ],
      },
    },
    take: batchSize,
    orderBy: { createdAt: "asc" },
  });

  let processed = 0;
  let errors = 0;

  for (const job of pendingJobs) {
    try {
      await executeSingleJob(job.id);
      processed++;
      // Khoảng nghỉ nhỏ 1.5 giây giữa các job để tránh rate limit của Facebook
      await new Promise((res) => setTimeout(res, 1500));
    } catch (err) {
      console.error(`Lỗi xử lý job ${job.id}:`, err);
      errors++;
    }
  }

  return { processed, errors };
}
