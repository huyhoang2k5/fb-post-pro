import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getQueueStatus } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalPosts,
      publishedPosts,
      scheduledPosts,
      totalJobs,
      pendingJobs,
      processingJobs,
      publishedJobs,
      failedJobs,
      manualJobs,
      cancelledJobs,
      totalPages,
      totalGroups,
      totalProducts,
      totalCampaigns,
      recentJobs,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "COMPLETED" } }),
      prisma.post.count({ where: { status: "SCHEDULED" } }),
      prisma.postJob.count(),
      prisma.postJob.count({ where: { status: "PENDING" } }),
      prisma.postJob.count({ where: { status: "PROCESSING" } }),
      prisma.postJob.count({ where: { status: "PUBLISHED" } }),
      prisma.postJob.count({ where: { status: "FAILED" } }),
      prisma.postJob.count({ where: { status: "MANUAL_ACTION_REQUIRED" } }),
      prisma.postJob.count({ where: { status: "CANCELLED" } }),
      prisma.destination.count({ where: { type: "PAGE" } }),
      prisma.destination.count({ where: { type: "GROUP" } }),
      prisma.product.count(),
      prisma.campaign.count(),
      prisma.postJob.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          destination: true,
          post: {
            select: { id: true, title: true },
          },
        },
      }),
    ]);

    const queueStatus = await getQueueStatus();

    const successRate = totalJobs > 0 ? Math.round((publishedJobs / totalJobs) * 100) : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalPosts,
        publishedPosts,
        scheduledPosts,
        totalJobs,
        jobStatuses: {
          PENDING: pendingJobs,
          PROCESSING: processingJobs,
          PUBLISHED: publishedJobs,
          FAILED: failedJobs,
          MANUAL_ACTION_REQUIRED: manualJobs,
          CANCELLED: cancelledJobs,
        },
        successRate,
        destinations: {
          totalPages,
          totalGroups,
          total: totalPages + totalGroups,
        },
        totalProducts,
        totalCampaigns,
        recentJobs,
        queueStatus,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
