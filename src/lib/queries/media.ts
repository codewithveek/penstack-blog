import "server-only";
import { db } from "@/db";
import { medias } from "@/db/schemas";
import { and, desc, asc, eq, sql, ilike } from "drizzle-orm";
import { MediaType } from "@/types";
import { unstable_cache } from "next/cache";

export const fetchMediaWithFilters = unstable_cache(
  async ({
    page,
    limit,
    search,
    type,
    folder,
    sortBy,
    sortOrder,
  }: {
    page: number;
    limit: number;
    search: string | null;
    type: string | null;
    folder: string | null;
    sortBy: "created_at" | "name" | "size";
    sortOrder: string;
  }) => {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];
    if (search) {
      whereConditions.push(ilike(medias.name, `%${search}%`));
    }
    if (type) {
      whereConditions.push(eq(medias.type, type as MediaType));
    }
    if (folder) {
      whereConditions.push(eq(medias.folder, folder));
    }

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(medias)
      .where(and(...whereConditions));

    const total = Number(totalResult[0].count);

    // Get paginated results
    const results = await db
      .select()
      .from(medias)
      .where(and(...whereConditions))
      .orderBy(
        sortOrder === "desc" ? desc(medias[sortBy]) : asc(medias[sortBy])
      )
      .limit(limit)
      .offset(offset);

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
  ["media-filters"],
  {
    revalidate: 60 * 60 * 24, // 24 hours
    tags: ["media-filters"],
  }
);

export const fetchMediaFolders = unstable_cache(
  async () => {
    const folders = await db
      .selectDistinct({ folder: medias.folder })
      .from(medias)
      .orderBy(asc(medias.folder));

    return folders?.length ? folders.map((f) => f.folder) : [];
  },
  ["media-folders"],
  {
    revalidate: 1000 * 60 * 60 * 24, // 24 hours
    tags: ["media-folders"],
  }
);
