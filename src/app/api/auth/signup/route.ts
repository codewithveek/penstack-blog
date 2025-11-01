import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/queries/create-user";
import { getUser } from "@/lib/queries/get-user";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { data: null, message: "Missing required fields" },
        { status: 400 }
      );
    }
    const username = email.split("@")[0];
    const existingUser = await getUser(email);

    if (existingUser) {
      return NextResponse.json(
        { data: null, message: "User already exists" },
        { status: 400 }
      );
    }
    const user = await createUser({ name, email, password, username });
    return NextResponse.json({
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: "Error creating user" },
      { status: 500 }
    );
  }
}
