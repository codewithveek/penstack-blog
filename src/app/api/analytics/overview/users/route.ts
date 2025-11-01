import { db } from "@/db";
import { users } from "@/db/schemas/users.sql";
import { NextResponse } from "next/server";
import { and, count, eq, gte, lt } from "drizzle-orm";
import { calculatePercentageDifference } from "@/utils";

export async function GET() {
  try {
    // Get total users count
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.account_status, "active"));

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(now.getDate() - 14);

    // Get users count for current week
    const currentWeekUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.account_status, "active"),
          gte(users.created_at, oneWeekAgo),
          lt(users.created_at, now)
        )
      );

    // Get users count for previous week
    const previousWeekUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.account_status, "active"),
          gte(users.created_at, twoWeeksAgo),
          lt(users.created_at, oneWeekAgo)
        )
      );

    const currentWeekCount = currentWeekUsers[0].count;
    const previousWeekCount = previousWeekUsers[0].count;
    const isUp = currentWeekCount > previousWeekCount;

    return NextResponse.json({
      total: totalUsers[0].count,
      weeklyGrowth: calculatePercentageDifference(
        previousWeekCount,
        currentWeekCount
      ).raw,
      isUp,
    });
  } catch (error) {
    console.error("Error fetching users analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch users analytics" },
      { status: 500 }
    );
  }
}
