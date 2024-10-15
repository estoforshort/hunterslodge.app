import { Queue } from "bullmq";

const options = {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
};

export const updateQueue = new Queue("update", options);
