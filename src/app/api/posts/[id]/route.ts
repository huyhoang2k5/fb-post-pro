import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
            logs: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        schedules: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi lấy chi tiết bài đăng" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi xóa bài viết" },
      { status: 500 }
    );
  }
}
