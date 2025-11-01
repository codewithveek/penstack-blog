import { db } from "@/db";
import { comments } from "@/db/schemas/posts.sql";
import { NextResponse } from "next/server";
import { and, count, eq, gte, inArray, lt } from "drizzle-orm";
import { calculatePercentageDifference } from "@/utils";

export async function GET() {
  try {
    // Get total comments count
    const totalComments = await db
      .select({ count: count() })
      .from(comments)
      .where(inArray(comments.status, ["approved", "pending"]));

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Get comments count for current week
    const currentWeekComments = await db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          inArray(comments.status, ["approved", "pending"]),
          gte(comments.created_at, oneWeekAgo),
          lt(comments.created_at, now)
        )
      );

    // Get comments count for previous week
    const previousWeekComments = await db
      .select({ count: count() })
      .from(comments)
      .where(
        and(
          inArray(comments.status, ["approved", "pending"]),
          gte(comments.created_at, twoWeeksAgo),
          lt(comments.created_at, oneWeekAgo)
        )
      );

    const currentWeekCount = currentWeekComments[0].count;
    const previousWeekCount = previousWeekComments[0].count;
    const isUp = currentWeekCount > previousWeekCount;

    return NextResponse.json({
      total: totalComments[0].count,
      weeklyGrowth: calculatePercentageDifference(
        previousWeekCount,
        currentWeekCount
      ).raw,
      isUp,
    });
  } catch (error) {
    console.error("Error fetching comments analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments analytics" },
      { status: 500 }
    );
  }
}
