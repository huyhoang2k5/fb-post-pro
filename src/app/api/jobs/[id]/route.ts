import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.postJob.findUnique({
      where: { id: params.id },
      include: {
        post: {
          include: {
            postMedias: {
              include: { media: true },
            },
          },
        },
        destination: true,
        logs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Không tìm thấy job" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi lấy chi tiết job" },
      { status: 500 }
    );
  }
}
