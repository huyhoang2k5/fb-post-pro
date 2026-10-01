import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const medias = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: medias });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Thêm media trực tiếp bằng URL ảnh
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const body = await req.json();
    const { fileUrl, name, fileType } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "Thiếu URL hình ảnh" }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        userId: user.id,
        name: name || "Ảnh đính kèm",
        fileUrl,
        fileType: fileType || "image/jpeg",
      },
    });

    return NextResponse.json({ success: true, data: media });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
