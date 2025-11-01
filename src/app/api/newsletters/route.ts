import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schemas";
import { NewsletterInsert } from "@/types";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkPermission } from "@/lib/auth/check-permission";

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
  try {
    const { email, name, referrer } = await req.json();

    const _referrer = referrer || (await headers().get("referer")) || null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        {
          data: null,
          error: "Invalid email format",
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    if (name && name.length > 50) {
      return NextResponse.json(
        {
          data: null,
          error: "Name too long",
          message: "Name must be less than 50 characters",
        },
        { status: 400 }
      );
    }
    // check if subscriber already exist

    const existingEmail = await db.query.newsletterSubscribers.findFirst({
      where: eq(
        sql`lower(${newsletterSubscribers.email})`,
        email.toLowerCase()
      ),
    });

    if (existingEmail) {
      // if the user previously unsubscribed
      if (existingEmail.status === "unsubscribed") {
        // resubscribe them
        await db
          .update(newsletterSubscribers)
          .set({
            status: "subscribed",
          })
          .where(eq(newsletterSubscribers.id, existingEmail.id));

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
          referrer: _referrer,
        })
        .onDuplicateKeyUpdate({
          set: {
            email: email.toLowerCase(),
            status: "subscribed",
          },
        });

      return NextResponse.json(
        {
          data: { isSubscribed: true, isVerified: false },
          message: "Newsletter subscription created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
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
