import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // PAGE, GROUP, or ALL
    const search = searchParams.get("search");

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ data: [] });
    }

    const where: any = {};

    if (type && type !== "ALL") {
      where.type = type;
    }
    if (search && search.trim()) {
      where.name = { contains: search.trim() };
    }

    const destinations = await prisma.destination.findMany({
      where,
      include: {
        connection: {
          select: {
            id: true,
            fbName: true,
            status: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: destinations,
      total: destinations.length,
      pagesCount: destinations.filter((d) => d.type === "PAGE").length,
      groupsCount: destinations.filter((d) => d.type === "GROUP").length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi lấy danh sách đích đến" },
      { status: 500 }
    );
  }
}
