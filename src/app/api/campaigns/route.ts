import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Chưa xác thực" }, { status: 401 });

    const body = await req.json();
    const { name, description, startDate, endDate, status, budget } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên chiến dịch không được để trống" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "ACTIVE",
        budget: budget ? parseFloat(budget) : null,
      },
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
