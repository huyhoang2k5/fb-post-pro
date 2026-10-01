import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const body = await req.json();
    const { title, content, category, tags, defaultContact } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tiêu đề và nội dung mẫu bài" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        category: category || "PROMOTION",
        tags: tags ? tags.trim() : null,
        defaultContact: defaultContact ? defaultContact.trim() : null,
      },
    });

    return NextResponse.json({ success: true, data: template });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
