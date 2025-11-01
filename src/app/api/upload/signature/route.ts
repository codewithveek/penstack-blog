import { NextRequest, NextResponse } from "next/server";
import { generateSignature } from "@/lib/cloudinary";
import { getSettings } from "@/lib/queries/settings";
import { decryptKey } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timestamp = Math.round(new Date().getTime() / 1000);
  const settings = await getSettings();
  const folder =
    searchParams.get("folder") ||
    settings.defaultMediaFolder.value ||
    "uploads";
  let apiSecret = settings.cloudinaryApiSecret.value;
  if (!apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary API secret is not set" },
      { status: 500 }
    );
  }
  apiSecret = decryptKey(apiSecret);
  try {
    const signature = await generateSignature(folder, timestamp, apiSecret);
    return NextResponse.json({
      signature,
      timestamp,
      cloudName: settings.cloudinaryCloudName.value,
      apiKey: settings.cloudinaryApiKey.value,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
