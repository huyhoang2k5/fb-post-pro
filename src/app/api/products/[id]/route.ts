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
    const { name, sku, price, originalPrice, description, linkUrl, contactInfo, mediaUrls, status } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: name?.trim(),
        sku: sku ? sku.trim() : null,
        price: price !== undefined ? parseFloat(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        linkUrl: linkUrl !== undefined ? linkUrl?.trim() : undefined,
        contactInfo: contactInfo !== undefined ? contactInfo?.trim() : undefined,
        mediaUrls: Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : mediaUrls,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, data: product });
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

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
