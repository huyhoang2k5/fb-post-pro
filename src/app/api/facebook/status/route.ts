import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ connected: false });
    }

    const connection = await prisma.facebookConnection.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { destinations: true },
        },
      },
    });

    if (!connection) {
      return NextResponse.json({
        connected: false,
        message: "Chưa kết nối tài khoản Facebook",
      });
    }

    const [pagesCount, groupsCount] = await Promise.all([
      prisma.destination.count({
        where: { connectionId: connection.id, type: "PAGE" },
      }),
      prisma.destination.count({
        where: { connectionId: connection.id, type: "GROUP" },
      }),
    ]);

    const isTokenExpiringSoon = connection.tokenExpiresAt
      ? connection.tokenExpiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
      : false;

    return NextResponse.json({
      connected: true,
      connection: {
        id: connection.id,
        fbUserId: connection.fbUserId,
        fbName: connection.fbName,
        fbEmail: connection.fbEmail,
        avatarUrl: connection.avatarUrl,
        status: connection.status,
        scopes: connection.scopes ? connection.scopes.split(",") : [],
        tokenExpiresAt: connection.tokenExpiresAt,
        isTokenExpiringSoon,
        createdAt: connection.createdAt,
      },
      stats: {
        totalPages: pagesCount,
        totalGroups: groupsCount,
        totalDestinations: pagesCount + groupsCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi kiểm tra trạng thái kết nối" },
      { status: 500 }
    );
  }
}
