import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Your database connection
import { medias } from "@/db/schemas"; // Your schema
import { MediaType } from "@/types";
import { eq } from "drizzle-orm";
import { determineFileType } from "@/utils/upload";
import { checkPermission } from "@/lib/auth/check-permission";
import { revalidateTag } from "next/cache";
import { generateCloudinaryUrl } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  return await checkPermission(
    { requiredPermission: "media:upload" },
    async () => {
      try {
        const data = await request.json();
        const result = await db.transaction(async (tx) => {
          const [response] = await tx
            .insert(medias)
            .values({
              name: data.original_filename,
              url: await generateCloudinaryUrl(data),
              thumbnail: await generateCloudinaryUrl(data, [
                "w_250",
                "q_auto",
                "f_auto",
              ]),
              preview: await generateCloudinaryUrl(data, [
                "w_500",
                "q_auto",
                "f_auto",
              ]),
              type: determineFileType(data.format || data.resource_type),
              size: data.bytes,
              mime_type: data.format
                ? `image/${data.format}`
                : data.resource_type,
              width: data.width,
              height: data.height,
              folder: data.asset_folder,
              caption: data.caption,
              alt_text: data.alt_text || data.original_filename,
            })
            .$returningId();
          return await tx.query.medias.findFirst({
            where: eq(medias.id, response.id),
          });
        });
        revalidateTag("media-filters");

        return NextResponse.json(result);
      } catch (error) {
        console.log(error);

        return NextResponse.json(
          { error: "Failed to save media data" },
          { status: 500 }
        );
      }
    }
  );
}
