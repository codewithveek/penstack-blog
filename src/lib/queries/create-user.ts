import "server-only";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { UserInsert } from "@/types";

export async function createUser({
  name,
  email,
  password,
  username,
}: {
  name: string;
  email: string;
  password: string;
  username: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [userRes] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        username,
        auth_type: "local",
        role_id: 5,
      })
      .$returningId();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userRes.id),
      columns: {
        password: false,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error creating user");
  }
}
export async function createOauthUser({
  auth_id,
  name,
  email,
  username,
  avatar,
  auth_type,
  role_id,
}: {
  auth_id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  auth_type: NonNullable<UserInsert["auth_type"]>;
  role_id: number;
}) {
  try {
    const [userRes] = await db
      .insert(users)
      .values({
        name,
        email,
        role_id,
        username,
        auth_type,
        avatar,
      })
      .$returningId();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userRes.id),
      columns: {
        password: false,
      },
    });
    return user;
  } catch (error) {
    throw new Error("Error creating user");
  }
}
