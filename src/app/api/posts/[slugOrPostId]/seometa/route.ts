import { db } from "@/db";
import { posts, postSeoMeta } from "@/db/schemas";
import { getPostForEditing } from "@/lib/queries/post";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const { slugOrPostId } = params;
    const body = await req.json();
    const { title, description, image, canonical_url, keywords } = body;

    const post = await getPostForEditing(slugOrPostId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const seoMeta = await db.transaction(async (tx) => {
      const currentSeoMeta = await tx.query.postSeoMeta.findFirst({
        where: eq(postSeoMeta.post_id, post.id),
      });
      if (currentSeoMeta) {
        await tx
          .update(postSeoMeta)
          .set({
            title,
            description,
            canonical_url,
            image,
            keywords: JSON.stringify(keywords),
          })
          .where(eq(postSeoMeta.id, currentSeoMeta.id));
        // if the post has no seo meta id, set it to the current seo meta id
        if (!post.seo_meta_id) {
          await tx
            .update(posts)
            .set({
              seo_meta_id: currentSeoMeta.id,
            })
            .where(eq(posts.id, post.id));
        }
      } else {
        const [insertedSeoMeta] = await tx
          .insert(postSeoMeta)
          .values({
            post_id: post.id,
            title,
            description,
            canonical_url,
            image,
            keywords: JSON.stringify(keywords),
          })
          .$returningId();
        await tx
          .update(posts)
          .set({
            seo_meta_id: insertedSeoMeta.id,
          })
          .where(eq(posts.id, post.id));
      }
      return await tx.query.postSeoMeta.findFirst({
        where: eq(postSeoMeta.post_id, post.id),
      });
    });
    const meta = {
      ...seoMeta,
      keywords: JSON.parse(seoMeta?.keywords || "[]"),
    };
    revalidateTag("getPostWithCache");
    revalidateTag("getPlainPostWithCache");

    return NextResponse.json({ message: "SEO meta saved", data: meta });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save SEO meta" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slugOrPostId: string } }
) {
  try {
    const { slugOrPostId } = params;
    const post = await getPostForEditing(slugOrPostId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const seoMeta = await db.query.postSeoMeta.findFirst({
      where: eq(postSeoMeta.post_id, post.id),
    });
    if (!seoMeta) {
      return NextResponse.json(
        { error: "SEO meta not found" },
        { status: 404 }
      );
    }
    const meta = {
      ...seoMeta,
      keywords: JSON.parse(seoMeta.keywords || "[]"),
    };
    return NextResponse.json({ message: "SEO meta fetched", data: meta });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch SEO meta" },
      { status: 500 }
    );
  }
}
