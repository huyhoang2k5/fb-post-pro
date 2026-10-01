import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
    }

    const { id } = await req.json().catch(() => ({ id: null }));

    if (id) {
      await prisma.facebookConnection.delete({
        where: { id },
      });
    } else {
      await prisma.facebookConnection.deleteMany({
        where: { userId: user.id },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "FB_DISCONNECTED",
        entityType: "FacebookConnection",
        details: "Đã hủy kết nối tài khoản Facebook",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Đã ngắt kết nối tài khoản Facebook thành công.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi ngắt kết nối Facebook" },
      { status: 500 }
    );
  }
}
