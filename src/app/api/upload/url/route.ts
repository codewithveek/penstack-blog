import { NextRequest, NextResponse } from "next/server";
import { generateCloudinaryUrl, uploadFromUrl } from "@/lib/cloudinary";
import { db } from "@/db";
import { medias } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { determineFileType } from "@/utils/upload";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const { url, folder = "uploads", filename } = await request.json();

    const cloudinaryResponse = await uploadFromUrl({ url, folder, filename });

    const result = await db.transaction(async (tx) => {
      const [response] = await tx
        .insert(medias)
        .values({
          name: filename || cloudinaryResponse.original_filename,
          url: await generateCloudinaryUrl(cloudinaryResponse as any),
          thumbnail: await generateCloudinaryUrl(cloudinaryResponse as any, [
            "w_250",
            "q_auto",
            "f_auto",
          ]),
          preview: await generateCloudinaryUrl(cloudinaryResponse as any, [
            "w_500",
            "q_auto",
            "f_auto",
          ]),
          type: determineFileType(
            cloudinaryResponse.format || cloudinaryResponse.resource_type
          ),
          size: cloudinaryResponse.bytes,
          mime_type: cloudinaryResponse.format
            ? `image/${cloudinaryResponse.format}`
            : cloudinaryResponse.resource_type,
          width: cloudinaryResponse.width,
          height: cloudinaryResponse.height,
          folder: cloudinaryResponse.asset_folder,
          caption: cloudinaryResponse.caption,
          alt_text:
            cloudinaryResponse.alt_text ||
            filename ||
            cloudinaryResponse.original_filename,
        })
        .$returningId();
      return await tx.query.medias.findFirst({
        where: eq(medias.id, response.id),
      });
    });
    revalidateTag("media-filters");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error server:", error);
    return NextResponse.json(
      { error: "Failed to upload from URL" },
      { status: 500 }
    );
  }
}
