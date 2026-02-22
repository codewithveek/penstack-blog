/**
 * apps/api/src/providers/search/index.ts
 *
 * Resolves the configured search provider.
 * Called ONCE in container.ts.
 */

import type { ISearchProvider } from "@cms/core/types/providers";
import type { DB } from "@cms/core/db/client";
import { ConfigurationError } from "@cms/core/errors";
import { TiDBSearchAdapter } from "./tidb.adapter";
import { MeilisearchAdapter } from "./meilisearch.adapter";

export function resolveSearchProvider(db: DB): ISearchProvider {
  const provider = process.env.SEARCH_PROVIDER ?? "tidb";

  if (provider === "tidb") {
    return new TiDBSearchAdapter(db);
  }

  if (provider === "meilisearch") {
    const host = process.env.MEILISEARCH_HOST;
    const apiKey = process.env.MEILISEARCH_API_KEY;

    if (!host || !apiKey) {
      throw new ConfigurationError(
        "MEILISEARCH_HOST and MEILISEARCH_API_KEY are required when SEARCH_PROVIDER=meilisearch"
      );
    }

    return new MeilisearchAdapter(host, apiKey);
  }

  throw new ConfigurationError(
    `Unknown SEARCH_PROVIDER: ${provider}. Supported: tidb, meilisearch`
  );
}
