import { NextRequest, NextResponse } from "next/server";
import { fetchMediaFolders } from "@/lib/queries/media";

export async function GET(req: NextRequest) {
  try {
    const _folders = await fetchMediaFolders();

    return NextResponse.json({
      message: "Folders retrieved successfully",
      data: _folders,
    });
  } catch (error) {
    return NextResponse.json({
      error,
      data: null,
      message: "Something went wrong... Couldn't fetch folder.",
    });
  }
}
