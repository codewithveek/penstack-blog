import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/queries/settings";
import { revalidatePath, revalidateTag } from "next/cache";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      data: settings || {},
      message: "Settings fetched successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await updateSettings(data);
    revalidatePath("/");
    revalidateTag("getSettings");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.debug("Error", error as any);

    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
