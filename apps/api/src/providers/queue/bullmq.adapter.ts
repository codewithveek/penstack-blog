/**
 * apps/api/src/providers/queue/bullmq.adapter.ts
 *
 * BullMQ queue provider adapter.
 * The ONLY file that imports BullMQ.
 */

import { Queue, Job } from "bullmq";
import type {
  IQueueProvider,
  JobOptions,
} from "@cms/core/types/providers";
import { ProviderError } from "@cms/core/errors";

export class BullMQQueueAdapter implements IQueueProvider {
  readonly name = "bullmq";
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly redisUrl: string) {}

  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(
        name,
        new Queue(name, { connection: { url: this.redisUrl } })
      );
    }
    return this.queues.get(name)!;
  }

  async enqueue<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobOptions
  ): Promise<string> {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.add(jobName, data, {
        ...(options?.delay !== undefined && { delay: options.delay }),
        attempts: options?.attempts ?? 3,
        backoff: options?.backoff ?? { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
        ...(options?.priority !== undefined && { priority: options.priority }),
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

  async cancelJob(jobId: string): Promise<void> {
    // Iterate all known queues to find and remove the job by its ID
    for (const [, queue] of this.queues) {
      try {
        const job = await Job.fromId(queue, jobId);
        if (job) {
          await job.remove();
          return;
        }
      } catch {
        // Job not in this queue — continue searching
      }
    }
    // Job not found — treat as already completed/removed (no-op)
  }

  async close(): Promise<void> {
    await Promise.all([...this.queues.values()].map((q) => q.close()));
  }
}
