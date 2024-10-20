import { Queue, Worker } from "bullmq";

import type { Job } from "bullmq";
import type { UpdateType } from "@prisma/client";

const connection = {
  host: "127.0.0.1",
  port: 6379,
};

const queueOptions = {
  connection,
};

const workerOptions = {
  connection,
  removeOnComplete: { count: 0 },
  removeOnFail: { count: 0 },
  concurrency: 1,
  autorun: false,
};

const jobQueue = new Queue("jobs", queueOptions);

export const worker = new Worker(
  "jobs",
  async (job: Job) => {
    if (job.data.type === "UPDATE") {
      return await runUpdate(job.data.updateId);
    }
  },
  workerOptions,
);

type JobData = {
  type: "UPDATE";
  update?: {
    id: number;
    type: UpdateType;
  };
};

export const addJob = async (data: JobData) => {
  try {
    if (data.type === "UPDATE" && data.update) {
      if (data.update.type === "OVERLAY") {
        return await jobQueue.add(
          "job",
          { type: "UPDATE", updateId: data.update.id },
          { priority: 1 },
        );
      } else if (
        data.update.type === "MANUAL" ||
        data.update.type === "FORCED"
      ) {
        return await jobQueue.add(
          "job",
          { type: "UPDATE", updateId: data.update.id },
          { priority: 2 },
        );
      } else if (data.update.type === "INITIAL") {
        return await jobQueue.add(
          "job",
          { type: "UPDATE", updateId: data.update.id },
          { priority: 3 },
        );
      } else {
        return await jobQueue.add(
          "job",
          { type: "UPDATE", updateId: data.update.id },
          { priority: 4 },
        );
      }
    }

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};
