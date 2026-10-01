import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enqueuePostJob } from "@/lib/queue";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.postJob.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Không tìm thấy job" }, { status: 404 });
    }

    // Đặt lại trạng thái PENDING
    await prisma.postJob.update({
      where: { id: params.id },
      data: {
        status: "PENDING",
        errorMessage: null,
      },
    });

    await prisma.postJobLog.create({
      data: {
        postJobId: job.id,
        level: "INFO",
        message: "Người dùng kích hoạt thử lại (Retry) đăng bài",
      },
    });

    // Đẩy lại vào hàng đợi
    await enqueuePostJob(job.id, 500);

    return NextResponse.json({
      success: true,
      message: "Đã đưa job vào hàng đợi xử lý lại",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi thử lại job" },
      { status: 500 }
    );
  }
}
