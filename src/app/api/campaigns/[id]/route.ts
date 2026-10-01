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
    const { name, description, startDate, endDate, status, budget } = body;

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        name: name?.trim(),
        description: description !== undefined ? description?.trim() : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status || undefined,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: campaign });
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

    await prisma.campaign.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa chiến dịch" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
