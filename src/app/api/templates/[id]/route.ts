import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const body = await req.json();
    const { title, content, category, tags, defaultContact } = body;

    const template = await prisma.template.update({
      where: { id: params.id },
      data: {
        title: title?.trim(),
        content: content?.trim(),
        category: category || undefined,
        tags: tags !== undefined ? tags?.trim() : undefined,
        defaultContact: defaultContact !== undefined ? defaultContact?.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    await prisma.template.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa mẫu bài viết" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
