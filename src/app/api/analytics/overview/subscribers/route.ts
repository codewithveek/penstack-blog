import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schemas/newsletter.sql";
import { desc, sql, count, and, eq, gte, lt } from "drizzle-orm";
import { calculatePercentageDifference } from "@/utils";

export async function GET() {
  try {
    // Get total subscribers count
    const totalSubscribers = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "subscribed"));

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Get subscribers count for current week
    const currentWeekSubscribers = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.status, "subscribed"),
          gte(newsletterSubscribers.created_at, oneWeekAgo),
          lt(newsletterSubscribers.created_at, now)
        )
      );

    // Get subscribers count for previous week
    const previousWeekSubscribers = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.status, "subscribed"),
          gte(newsletterSubscribers.created_at, twoWeeksAgo),
          lt(newsletterSubscribers.created_at, oneWeekAgo)
        )
      );

    const currentWeekCount = currentWeekSubscribers[0].count;
    const previousWeekCount = previousWeekSubscribers[0].count;
    const isUp = currentWeekCount > previousWeekCount;

    return NextResponse.json({
      total: totalSubscribers[0].count,
      weeklyGrowth: calculatePercentageDifference(
        previousWeekCount,
        currentWeekCount
      ).raw,
      isUp,
    });
  } catch (error) {
    console.error("Error fetching subscribers analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers analytics" },
      { status: 500 }
    );
  }
}
