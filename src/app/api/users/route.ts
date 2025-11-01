import { db } from "@/db";
import { users } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { hash } from "bcryptjs";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const search = searchParams.get("search");
  const sortBy =
    (searchParams.get("sortBy") as "created_at" | "name") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const offset = (page - 1) * limit;
  return await checkPermission(
    { requiredPermission: "users:read" },
    async () => {
      // Build where conditions
      const whereConditions = [];
      if (search) {
        whereConditions.push(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.username, `%${search}%`)
          )
        );
      }

      try {
        // Get total count
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(...whereConditions));

        const total = Number(totalResult[0].count);

        const _users = await db.query.users.findMany({
          columns: {
            password: false,
          },
          limit,
          offset,
          orderBy: [
            sortOrder === "desc" ? desc(users[sortBy]) : asc(users[sortBy]),
          ],
          where:
            whereConditions?.length > 0 ? and(...whereConditions) : undefined,
        });

        return NextResponse.json({
          data: _users,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          message: "Users fetched successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          {
            data: null,
            error: error?.message,
            message: "Something went wrong... could not fetch users",
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
  return await checkPermission(
    { requiredPermission: "users:write" },
    async () => {
      const {
        name,
        email,
        username,
        password,
        role_id = 5,
        avatar,
        bio,
      } = await req.json();

      try {
        let hashedPassword: string = "";
        if (password) {
          hashedPassword = await hash(password, 10);
        }

        const user = await db.transaction(async (tx) => {
          const [insertResponse] = await tx
            .insert(users)
            .values({
              name,
              email,
              username,
              ...(hashedPassword ? { password: hashedPassword } : {}),
              role_id,
              avatar,
              bio,
            })
            .$returningId();
          return await tx.query.users.findFirst({
            where: eq(users.id, insertResponse.id),
            columns: {
              password: false,
            },
          });
        });

        return NextResponse.json({
          data: user,
          message: "User created successfully",
        });
      } catch (error: any) {
        return NextResponse.json(
          {
            data: null,
            error: error?.message,
            message: "Error creating user",
          },
          {
            status: 500,
          }
        );
      }
    }
  );
}
