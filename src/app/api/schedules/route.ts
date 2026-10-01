import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        post: {
          include: {
            product: true,
            campaign: true,
            postMedias: {
              include: { media: true },
            },
            jobs: {
              include: { destination: true },
            },
          },
        },
      },
      orderBy: { scheduledTime: "asc" },
    });

    return NextResponse.json({ success: true, data: schedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
