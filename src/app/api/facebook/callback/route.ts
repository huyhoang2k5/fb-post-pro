import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  exchangeCodeForToken,
  getLongLivedUserToken,
  getFacebookUserProfile,
  getFacebookPages,
  getFacebookGroups,
  REQUIRED_FB_SCOPES,
} from "@/lib/facebook";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (error || !code) {
    const errorMsg = errorDescription || error || "Người dùng từ chối cấp quyền Facebook";
    return NextResponse.redirect(
      `${baseUrl}/connections?error=${encodeURIComponent(errorMsg)}`
    );
  }

  try {
    // 1. Đổi code lấy short-lived access token
    const shortTokenRes = await exchangeCodeForToken(code);

    // 2. Nâng cấp lên Long-Lived User Access Token (hạn 60 ngày)
    const longTokenRes = await getLongLivedUserToken(shortTokenRes.access_token);
    const longLivedToken = longTokenRes.access_token;
    const expiresAt = longTokenRes.expires_in
      ? new Date(Date.now() + longTokenRes.expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    // 3. Lấy thông tin tài khoản Facebook người dùng
    const fbProfile = await getFacebookUserProfile(longLivedToken);

    // 4. Lấy danh sách Pages (kèm Page Access Token vĩnh viễn) & Groups
    const [pages, groups] = await Promise.all([
      getFacebookPages(longLivedToken),
      getFacebookGroups(longLivedToken),
    ]);

    // 5. Lấy hoặc tạo User trong hệ thống
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Không thể xác định người dùng hệ thống");
    }

    // 6. Lưu hoặc cập nhật FacebookConnection
    const connection = await prisma.facebookConnection.upsert({
      where: { fbUserId: fbProfile.id },
      update: {
        userId: currentUser.id,
        fbName: fbProfile.name,
        fbEmail: fbProfile.email,
        accessToken: longLivedToken,
        tokenExpiresAt: expiresAt,
        avatarUrl: fbProfile.picture?.data?.url,
        status: "ACTIVE",
        scopes: REQUIRED_FB_SCOPES.join(","),
      },
      create: {
        userId: currentUser.id,
        fbUserId: fbProfile.id,
        fbName: fbProfile.name,
        fbEmail: fbProfile.email,
        accessToken: longLivedToken,
        tokenExpiresAt: expiresAt,
        avatarUrl: fbProfile.picture?.data?.url,
        status: "ACTIVE",
        scopes: REQUIRED_FB_SCOPES.join(","),
      },
    });

    // 7. Đồng bộ Pages vào bảng Destination
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
          linkUrl: `https://facebook.com/${page.id}`,
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

    // 8. Đồng bộ Groups vào bảng Destination
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
          requiresManual: true, // Meta API v19.0+ yêu cầu thao tác có trợ giúp
          memberCount: group.member_count || 0,
          linkUrl: `https://facebook.com/groups/${group.id}`,
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

    // 9. Ghi Audit Log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "FB_CONNECTED",
        entityType: "FacebookConnection",
        entityId: connection.id,
        details: `Kết nối thành công tài khoản FB: ${fbProfile.name}. Đồng bộ ${pages.length} Pages và ${groups.length} Groups.`,
      },
    });

    return NextResponse.redirect(
      `${baseUrl}/connections?success=true&pages=${pages.length}&groups=${groups.length}&name=${encodeURIComponent(fbProfile.name)}`
    );
  } catch (err: any) {
    console.error("Lỗi callback Facebook OAuth:", err);
    return NextResponse.redirect(
      `${baseUrl}/connections?error=${encodeURIComponent(err.message || "Lỗi xử lý kết nối Facebook")}`
    );
  }
}
