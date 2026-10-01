import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateParentPostStatus } from "@/lib/worker";

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Thiếu jobId" }, { status: 400 });
    }

    const job = await prisma.postJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Không tìm thấy job" }, { status: 404 });
    }

    await prisma.postJob.update({
      where: { id: jobId },
      data: {
        status: "PUBLISHED",
        completedAt: new Date(),
        errorMessage: null,
      },
    });

    await prisma.postJobLog.create({
      data: {
        postJobId: jobId,
        level: "SUCCESS",
        message: "Người dùng đã sao chép và đăng thủ công thành công vào Group",
      },
    });

    await updateParentPostStatus(job.postId);

    return NextResponse.json({
      success: true,
      message: "Đã đánh dấu hoàn thành đăng bài thủ công!",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi cập nhật trạng thái thủ công" },
      { status: 500 }
    );
  }
}
