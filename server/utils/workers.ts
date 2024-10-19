import type { Job } from "bullmq";
import { Worker } from "bullmq";

const options = {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
  removeOnComplete: { count: 0 },
  removeOnFail: { count: 0 },
  concurrency: 1,
  autorun: false,
};

export const updateQueueWorker = new Worker(
  "update",
  async (job: Job) => {
    await runUpdate(job.data.updateId);
  },
  options,
);
