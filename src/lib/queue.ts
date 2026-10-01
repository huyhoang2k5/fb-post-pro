import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { executeSingleJob } from "./worker";

const QUEUE_NAME = "facebook-post-jobs";
let redisClient: Redis | null = null;
let postQueue: Queue | null = null;
let workerInstance: Worker | null = null;
let isRedisAvailable = false;

// Khởi tạo Redis nếu có biến môi trường
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Dừng retry nếu Redis không có sẵn
        }
        return 1000;
      },
    });

    // Bắt sự kiện error để tránh Unhandled error event trong Node.js
    redisClient.on("error", (err) => {
      isRedisAvailable = false;
    });

    redisClient
      .connect()
      .then(() => {
        isRedisAvailable = true;
        console.log("[Queue] Kết nối Redis BullMQ thành công!");
        initBullQueue();
      })
      .catch(() => {
        isRedisAvailable = false;
      });
  } catch (err: any) {
    isRedisAvailable = false;
  }
}

function initBullQueue() {
  if (!redisClient || postQueue) return;

  try {
    postQueue = new Queue(QUEUE_NAME, {
      connection: redisClient as any,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });

    workerInstance = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        const { jobId } = job.data;
        return await executeSingleJob(jobId);
      },
      {
        connection: redisClient as any,
        concurrency: 2,
      }
    );

    workerInstance.on("error", () => {});
  } catch {
    isRedisAvailable = false;
  }
}

/**
 * Đưa job vào hàng đợi
 */
export async function enqueuePostJob(jobId: string, delayMs: number = 0) {
  // Nếu có BullMQ và Redis khả dụng
  if (isRedisAvailable && postQueue) {
    try {
      await postQueue.add(
        "publish-post",
        { jobId },
        {
          delay: delayMs,
          jobId: `job-${jobId}`,
        }
      );
      return { method: "BULLMQ", queued: true };
    } catch {
      // fallback
    }
  }

  // Fallback: Xử lý qua asynchronous microtask / setTimeout
  setTimeout(async () => {
    try {
      await executeSingleJob(jobId);
    } catch (err) {
      console.error(`[In-Process Worker] Lỗi xử lý job ${jobId}:`, err);
    }
  }, Math.max(delayMs, 100));

  return { method: "IN_PROCESS", queued: true };
}

/**
 * Trạng thái hàng đợi
 */
export async function getQueueStatus() {
  return {
    isRedisConnected: isRedisAvailable,
    queueEngine: isRedisAvailable ? "BullMQ (Redis)" : "Database In-Process Runner (Auto-Fallback)",
    queueName: QUEUE_NAME,
  };
}
