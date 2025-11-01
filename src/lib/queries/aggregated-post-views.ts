import "server-only";
import { db } from "@/db";
import { and, between, eq, sql } from "drizzle-orm";
import { postViews } from "@/db/schemas/posts-analytics.sql";
import { AggregatedPostViews } from "@/types";

export const getAggregatedPostViews = async (
  startDate?: Date,
  endDate?: Date,
  postId?: number
) => {
  // First, create the date expression to ensure consistency
  const dateExpr = sql<Date>`DATE(${postViews.viewed_at})`;

  const query = db
    .select({
      viewed_date: dateExpr, // Use the same date expression
      total_views: sql<number>`count(*)`,
      unique_views: sql<number>`count(distinct case 
        when ${postViews.user_id} is not null then ${postViews.user_id}
        else concat(${postViews.ip_address}, ${postViews.user_agent})
      end)`,
      registered_user_views: sql<number>`count(distinct ${postViews.user_id})`,
      anonymous_views: sql<number>`sum(case when ${postViews.user_id} is null then 1 else 0 end)`,
    })
    .from(postViews)
    .where(
      and(
        postId ? eq(postViews.post_id, postId) : undefined,
        between(dateExpr, startDate, endDate || new Date())
      )
    )
    .groupBy(postViews.viewed_at) // Use the same date expression
    .orderBy(postViews.viewed_at); // Use the same date expression
  const data = await query;

  return mergeViewsByDate(data);
};
function mergeViewsByDate(data: AggregatedPostViews[]): AggregatedPostViews[] {
  if (data.length === 0) return [];
  return Object.values(
    data.reduce(
      (acc: Record<string, AggregatedPostViews>, item) => {
        const date = new Date(item.viewed_date).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            ...item,
            anonymous_views: Number(item.anonymous_views),
          };
        } else {
          acc[date].total_views += item.total_views;
          acc[date].unique_views += item.unique_views;
          acc[date].registered_user_views += item.registered_user_views;
          acc[date].anonymous_views += Number(item.anonymous_views);
        }
        return acc;
      },
      {} as Record<string, AggregatedPostViews>
    )
  );
}
