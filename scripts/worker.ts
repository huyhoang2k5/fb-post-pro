import { processAllPendingJobs } from "../src/lib/worker";

async function runWorkerLoop() {
  console.log("====================================================");
  console.log("🚀 FB Post Pro - Background Job Worker Started");
  console.log("====================================================");

  let isRunning = true;

  process.on("SIGINT", () => {
    console.log("\n[Worker] Nhận tín hiệu dừng, đang tắt tiến trình...");
    isRunning = false;
    process.exit(0);
  });

  while (isRunning) {
    try {
      const result = await processAllPendingJobs(10);
      if (result.processed > 0) {
        console.log(`[Worker] Đã xử lý ${result.processed} jobs (${result.errors} lỗi).`);
      }
    } catch (err: any) {
      console.error("[Worker] Lỗi trong chu kỳ quét:", err.message);
    }

    // Nghỉ 3 giây trước lần quét tiếp theo
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

runWorkerLoop();
