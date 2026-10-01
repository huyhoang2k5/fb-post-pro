import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl } from "@/lib/facebook";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirect = searchParams.get("redirect") === "true";
    const origin = req.nextUrl.origin;
    const authUrl = getMetaAuthUrl(state, origin);

    if (redirect) {
      return NextResponse.redirect(authUrl);
    }

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Lỗi tạo URL đăng nhập Meta OAuth",
      },
      { status: 500 }
    );
  }
}
