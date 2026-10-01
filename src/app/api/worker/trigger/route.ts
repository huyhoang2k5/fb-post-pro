import { NextResponse } from "next/server";
import { processAllPendingJobs } from "@/lib/worker";

export async function POST() {
  try {
    const result = await processAllPendingJobs(20);
    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt quét hàng đợi: Xử lý ${result.processed} jobs, ${result.errors} lỗi.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Lỗi xử lý hàng đợi" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
