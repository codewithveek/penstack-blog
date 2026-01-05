import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schemas";
import { NewsletterInsert } from "@/types";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/auth/check-permission";
import { newsletterSubscribeSchema } from "@/lib/validation/schemas";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { ZodError } from "zod";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  return await checkPermission(
    { requiredPermission: "newsletters:read" },
    async () => {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, Number(searchParams.get("page")) || 1);
      const limit = Math.min(
        100,
        Math.max(1, Number(searchParams.get("limit")) || 20)
      );
      const search = searchParams.get("search");
      const status = (searchParams.get("status") || "subscribed") as
        | NewsletterInsert["status"]
        | "all";
      const validSortFields = ["created_at", "email", "name"] as const;
      const sortBy = validSortFields.includes(searchParams.get("sortBy") as any)
        ? (searchParams.get("sortBy") as "created_at" | "email" | "name")
        : "created_at";

      const validSortOrders = ["asc", "desc"] as const;
      const sortOrder = validSortOrders.includes(
        searchParams.get("sortOrder") as any
      )
        ? (searchParams.get("sortOrder") as "asc" | "desc")
        : "desc";

      const offset = (page - 1) * limit;

      const whereConditions = [];
      if (search) {
        whereConditions.push(
          or(
            ilike(newsletterSubscribers.email, `%${search}%`),
            ilike(newsletterSubscribers.name, `%${search}%`)
          )
        );
      }
      if (status && status !== "all") {
        whereConditions.push(eq(newsletterSubscribers.status, status));
      }

      try {
        const orderBy = [
          sortOrder === "desc"
            ? desc(newsletterSubscribers[sortBy])
            : asc(newsletterSubscribers[sortBy]),
        ];
        const [totalResult, subscribers] = await Promise.all([
          db
            .select({ count: sql<number>`count(*)` })
            .from(newsletterSubscribers)
            .where(and(...whereConditions)),
          db.query.newsletterSubscribers.findMany({
            limit,
            offset,
            orderBy,
            where:
              whereConditions?.length > 0 ? and(...whereConditions) : undefined,
          }),
        ]);
        const total = totalResult[0].count;
        return NextResponse.json({
          data: subscribers,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          message: "Newsletter subscribers fetched successfully",
        });
      } catch (error: any) {
        logger.error("Error fetching newsletter subscribers", error, {
          page,
          limit,
          search,
        });
        return NextResponse.json(
          {
            data: null,
            error: error?.message,
            message: "Something went wrong... could not fetch subscribers",
          },
          {
            status: 500,
          }
        );
      }
    }
  );
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = rateLimit(req, 5, 60 * 1000);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const validated = newsletterSubscribeSchema.parse(body);
    const { email } = validated;
    const name = body.name;
    const referrer = body.referrer || (await headers().get("referer")) || null;

    const existingEmail = await db.query.newsletterSubscribers.findFirst({
      where: eq(
        sql`lower(${newsletterSubscribers.email})`,
        email.toLowerCase()
      ),
    });

    if (existingEmail) {
      if (existingEmail.status === "unsubscribed") {
        await db
          .update(newsletterSubscribers)
          .set({
            status: "subscribed",
          })
          .where(eq(newsletterSubscribers.id, existingEmail.id));

        logger.info("Newsletter resubscription", { email });

        return NextResponse.json({
          data: {
            isSubscribed: true,
            isVerified: existingEmail.verification_status === "verified",
          },
          message: "Newsletter re-subscription created successfully",
        });
      }

      return NextResponse.json({
        data: {
          isSubscribed: existingEmail.status === "subscribed",
          isVerified: existingEmail.verification_status === "verified",
        },
        message: "Member exists",
      });
    } else {
      await db
        .insert(newsletterSubscribers)
        .values({
          email: email.toLowerCase(),
          name,
          referrer,
        })
        .onDuplicateKeyUpdate({
          set: {
            email: email.toLowerCase(),
            status: "subscribed",
          },
        });

      logger.info("Newsletter subscription created", { email });

      return NextResponse.json(
        {
          data: { isSubscribed: true, isVerified: false },
          message: "Newsletter subscription created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      logger.warn("Newsletter subscription validation failed", {
        errors: error.issues,
      });
      return NextResponse.json(
        {
          data: null,
          error: "Validation failed",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error("Error creating newsletter subscription", error);
    return NextResponse.json(
      {
        data: null,
        error: error?.message,
        message: "Error creating newsletter subscription",
      },
      {
        status: 500,
      }
    );
  }
}
