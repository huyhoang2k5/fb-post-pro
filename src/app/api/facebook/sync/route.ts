import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFacebookPages, getFacebookGroups } from "@/lib/facebook";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });
    }

    const connection = await prisma.facebookConnection.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
    });

    if (!connection) {
      return NextResponse.json(
        { error: "Chưa có tài khoản Facebook nào được kết nối hoạt động" },
        { status: 400 }
      );
    }

    // Lấy lại danh sách Pages & Groups mới nhất từ Meta Graph API
    const [pages, groups] = await Promise.all([
      getFacebookPages(connection.accessToken),
      getFacebookGroups(connection.accessToken),
    ]);

    // Cập nhật Pages
    for (const page of pages) {
      await prisma.destination.upsert({
        where: {
          connectionId_platformId: {
            connectionId: connection.id,
            platformId: page.id,
          },
        },
        update: {
          name: page.name,
          type: "PAGE",
          category: page.category || "Facebook Page",
          avatarUrl: page.picture?.data?.url,
          pageAccessToken: page.access_token,
          canPost: true,
          requiresManual: false,
          memberCount: page.followers_count || page.fan_count || 0,
        },
        create: {
          connectionId: connection.id,
          platformId: page.id,
          name: page.name,
          type: "PAGE",
          category: page.category || "Facebook Page",
          avatarUrl: page.picture?.data?.url,
          pageAccessToken: page.access_token,
          canPost: true,
          requiresManual: false,
          memberCount: page.followers_count || page.fan_count || 0,
          linkUrl: `https://facebook.com/${page.id}`,
        },
      });
    }

    // Cập nhật Groups
    for (const group of groups) {
      await prisma.destination.upsert({
        where: {
          connectionId_platformId: {
            connectionId: connection.id,
            platformId: group.id,
          },
        },
        update: {
          name: group.name,
          type: "GROUP",
          category: "Facebook Group",
          avatarUrl: group.picture?.data?.url,
          canPost: false,
          requiresManual: true,
          memberCount: group.member_count || 0,
        },
        create: {
          connectionId: connection.id,
          platformId: group.id,
          name: group.name,
          type: "GROUP",
          category: "Facebook Group",
          avatarUrl: group.picture?.data?.url,
          canPost: false,
          requiresManual: true,
          memberCount: group.member_count || 0,
          linkUrl: `https://facebook.com/groups/${group.id}`,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "DESTINATIONS_SYNCED",
        entityType: "Destination",
        details: `Đồng bộ lại thành công ${pages.length} Pages và ${groups.length} Groups`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã đồng bộ thành công ${pages.length} Pages và ${groups.length} Groups từ Facebook.`,
      pagesCount: pages.length,
      groupsCount: groups.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi đồng bộ dữ liệu Facebook" },
      { status: 500 }
    );
  }
}
