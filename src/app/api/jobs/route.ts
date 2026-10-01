import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const postId = searchParams.get("postId");
    const destinationType = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "30");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (postId) {
      where.postId = postId;
    }
    if (destinationType && destinationType !== "ALL") {
      where.destination = { type: destinationType };
    }

    const [jobs, total] = await Promise.all([
      prisma.postJob.findMany({
        where,
        include: {
          post: {
            include: {
              postMedias: {
                include: { media: true },
              },
            },
          },
          destination: true,
          logs: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.postJob.count({ where }),
    ]);

    return NextResponse.json({
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi lấy danh sách công việc đăng bài" },
      { status: 500 }
    );
  }
}
