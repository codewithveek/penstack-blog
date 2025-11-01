import { NextRequest, NextResponse } from "next/server";
import { getAggregatedPostViews } from "@/lib/queries/aggregated-post-views";
import { AggregatedPostViews } from "@/types";
import { addDays, subDays, subYears } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const timeRange =
      (searchParams.get("timeRange") as "7" | "30" | "60" | "90" | "all") ||
      "7";

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7":
        startDate = subDays(startDate, 7);
        break;
      case "30":
        startDate = subDays(startDate, 30);
        break;
      case "60":
        startDate = subDays(startDate, 60);
        break;
      case "90":
        startDate = subDays(startDate, 90);
        break;
      case "all":
        // For "all time", we'll fetch from the beginning
        startDate = subYears(startDate, 2);
        break;
      default:
        startDate = subDays(startDate, 7); // Default to 7 days
    }

    // Query for daily views
    const viewsData = await getAggregatedPostViews(startDate, endDate);

    return NextResponse.json(
      {
        data: fillMissingDates(viewsData, startDate, endDate),

        timeRange,
        message: "Post views fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching post views:", error);
    return NextResponse.json(
      {
        error: "Failed to retrieve post views",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to fill in missing dates with zero views
function fillMissingDates(
  data: AggregatedPostViews[],
  startDate: Date,
  endDate: Date
) {
  const filledData: AggregatedPostViews[] = [];
  const currentDate = new Date(startDate);
  const dateMap = new Map(
    data.map((item) => [
      item.viewed_date,
      {
        total_views: item.total_views,
        unique_views: item.unique_views,
        registered_user_views: item.registered_user_views,
        anonymous_views: item.anonymous_views,
      },
    ])
  );

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    filledData.push({
      viewed_date: dateStr,

      total_views: dateMap.get(dateStr)?.total_views || 0,
      unique_views: dateMap.get(dateStr)?.unique_views || 0,
      registered_user_views: dateMap.get(dateStr)?.registered_user_views || 0,
      anonymous_views: dateMap.get(dateStr)?.anonymous_views || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return filledData;
}
