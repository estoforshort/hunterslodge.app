import { runUpdate } from "./jobs/update";
import { runRankings } from "./jobs/rank";
import { Queue, Worker } from "bullmq";

import type { UpdateType } from "@prisma/client";
import type {
  ConnectionOptions,
  Job,
  QueueOptions,
  WorkerOptions,
} from "bullmq";

const connection: ConnectionOptions = {
  host: "127.0.0.1",
  port: 6379,
};

const queueOptions: QueueOptions = {
  connection,
};

const jobQueue = new Queue("jobs", queueOptions);

type JobData = {
  type: "UPDATE" | "RANK";
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

    if (data.type === "RANK") {
      return await jobQueue.add("job", { type: "RANK" }, { priority: 1 });
    }

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

const workerOptions: WorkerOptions = {
  connection,
  removeOnComplete: { count: 0 },
  removeOnFail: { count: 0 },
  concurrency: 1,
  autorun: false,
};

export const worker = new Worker(
  "jobs",
  async (job: Job) => {
    if (job.data.type === "UPDATE") {
      return await runUpdate(job.data.updateId);
    }

    if (job.data.type === "RANK") {
      return await runRankings();
    }

    return;
  },
  workerOptions,
);
