import "server-only";
import { db } from "@/db";
import { users } from "@/db/schemas";
import { eq, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getUser = unstable_cache(
  async (emailOrAuthId: string, withPassword: boolean = true) => {
    const _emailOrAuthId = emailOrAuthId.toLowerCase();
    const cols = withPassword
      ? undefined
      : {
          password: false,
        };
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.email, _emailOrAuthId),
        eq(users.username, _emailOrAuthId),
        eq(users.auth_id, _emailOrAuthId)
      ),
      columns: cols,
    });
    return user;
  },
  undefined,
  { tags: ["getUser"], revalidate: 10 }
);

export const getUserWithPermissions = unstable_cache(
  async (emailOrAuthId: string, withPassword: boolean = true) => {
    const _emailOrAuthId = emailOrAuthId.toLowerCase();
    const cols = withPassword
      ? undefined
      : {
          password: false,
        };
    const user = await db.query.users.findFirst({
      where: or(
        eq(users.email, _emailOrAuthId),
        eq(users.username, _emailOrAuthId),
        eq(users.auth_id, _emailOrAuthId)
      ),
      columns: cols,
      with: {
        role: {
          with: {
            permissions: {
              with: {
                permission: true,
              },
            },
          },
        },
      },
    });
    let userPermissions;
    if (!user?.role) userPermissions = [];

    userPermissions = Array.from(
      new Set(user?.role.permissions.map((rp) => rp.permission.name))
    );
    return {
      ...user,
      permissions: userPermissions,
    };
  },
  undefined,
  {
    tags: ["getUserWithPermissions"],
    revalidate: 10,
  }
);
