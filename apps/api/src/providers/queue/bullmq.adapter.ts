/**
 * apps/api/src/providers/queue/bullmq.adapter.ts
 *
 * BullMQ queue provider adapter.
 * The ONLY file that imports BullMQ.
 */

import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import type {
  IQueueProvider,
  QueueJobOptions,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class BullMQQueueAdapter implements IQueueProvider {
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly connection: IORedis) {}

  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(name, new Queue(name, { connection: this.connection }));
    }
    return this.queues.get(name)!;
  }

  async enqueue<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: QueueJobOptions
  ): Promise<string> {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.add(jobName, data, {
        attempts: options?.attempts ?? 3,
        backoff: options?.backoff ?? { type: "exponential", delay: 2000 },
        removeOnComplete: options?.removeOnComplete ?? { count: 100 },
        removeOnFail: options?.removeOnFail ?? { count: 500 },
        jobId: options?.jobId,
      });
      return job.id!;
    } catch (err) {
      throw new ProviderError(
        "bullmq",
        `Failed to enqueue job: ${String(err)}`
      );
    }
  }

  async scheduleAt<T>(
    queueName: string,
    jobName: string,
    data: T,
    runAt: Date
  ): Promise<string> {
    const delay = Math.max(0, runAt.getTime() - Date.now());
    return this.enqueue(queueName, jobName, data, { delay });
  }

  async cancelJob(queueName: string, jobId: string): Promise<void> {
    try {
      const queue = this.getQueue(queueName);
      const job = await Job.fromId(queue, jobId);
      if (job) await job.remove();
    } catch (err) {
      throw new ProviderError("bullmq", `Failed to cancel job: ${String(err)}`);
    }
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()));
  }
}
