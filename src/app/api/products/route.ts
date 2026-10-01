import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { sku: { contains: search.trim() } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const body = await req.json();
    const { name, sku, price, originalPrice, description, linkUrl, contactInfo, mediaUrls, status } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên sản phẩm không được để trống" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: name.trim(),
        sku: sku ? sku.trim() : null,
        price: parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        description: description ? description.trim() : null,
        linkUrl: linkUrl ? linkUrl.trim() : null,
        contactInfo: contactInfo ? contactInfo.trim() : null,
        mediaUrls: Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : mediaUrls || null,
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
