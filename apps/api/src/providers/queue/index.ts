/**
 * apps/api/src/providers/queue/index.ts
 *
 * Resolves the queue provider and creates the Redis connection.
 * Called ONCE in container.ts.
 */

import IORedis from "ioredis";
import type { IQueueProvider } from "@cms/core/types/providers";
import { ConfigurationError } from "@cms/core/errors";
import { BullMQQueueAdapter } from "./bullmq.adapter";

let sharedRedis: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (sharedRedis) return sharedRedis;

  const url = process.env.REDIS_URL;
  if (!url) throw new ConfigurationError("REDIS_URL is required");

  sharedRedis = new IORedis(url, {
    maxRetriesPerRequest: null,
    lazyConnect: false,
  });
  return sharedRedis;
}

export function resolveQueueProvider(): IQueueProvider {
  const provider = process.env.QUEUE_PROVIDER ?? "bullmq";

  if (provider === "bullmq") {
    const url = process.env.REDIS_URL;
    if (!url) throw new ConfigurationError("REDIS_URL is required");
    return new BullMQQueueAdapter(url);
  }

  throw new ConfigurationError(
    `Unknown QUEUE_PROVIDER: ${provider}. Supported: bullmq`
  );
}
