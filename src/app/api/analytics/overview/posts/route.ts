import { db } from "@/db";
import { posts } from "@/db/schemas/posts.sql";
import { NextResponse } from "next/server";
import { and, count, eq, gte, inArray, lt } from "drizzle-orm";
import { calculatePercentageDifference } from "@/utils";

export async function GET() {
  try {
    // Get total posts count
    const totalPosts = await db
      .select({ count: count() })
      .from(posts)
      .where(inArray(posts.status, ["published", "draft"]));

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Get posts count for current week
    const currentWeekPosts = await db
      .select({ count: count() })
      .from(posts)
      .where(
        and(
          inArray(posts.status, ["published", "draft"]),
          gte(posts.created_at, oneWeekAgo),
          lt(posts.created_at, now)
        )
      );

    // Get posts count for previous week
    const previousWeekPosts = await db
      .select({ count: count() })
      .from(posts)
      .where(
        and(
          inArray(posts.status, ["published", "draft"]),
          gte(posts.created_at, twoWeeksAgo),
          lt(posts.created_at, oneWeekAgo)
        )
      );

    const currentWeekCount = currentWeekPosts[0].count;
    const previousWeekCount = previousWeekPosts[0].count;
    const isUp = currentWeekCount > previousWeekCount;

    return NextResponse.json({
      total: totalPosts[0].count,
      weeklyGrowth: calculatePercentageDifference(
        previousWeekCount,
        currentWeekCount
      ).raw,
      isUp,
    });
  } catch (error) {
    console.error("Error fetching posts analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts analytics" },
      { status: 500 }
    );
  }
}
