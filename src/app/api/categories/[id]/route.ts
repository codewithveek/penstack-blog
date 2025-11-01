import { db } from "@/db";
import { categories } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const { id } = params;
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    return NextResponse.json({ data: category });
  } catch (error: any) {
    return NextResponse.json(
      { data: null, error: error?.message, message: "Something went wrong..." },
      { status: 500 }
    );
  }
}
