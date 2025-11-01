import { db } from "@/db";
import { roles } from "@/db/schemas";
import { TPermissions } from "@/types";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getPublicPermissions = unstable_cache(
  async function (): Promise<TPermissions[]> {
    const publicRole = await db.query.roles.findFirst({
      where: eq(roles.name, "public"),
      with: {
        permissions: {
          with: {
            permission: true,
          },
        },
      },
    });

    if (!publicRole?.permissions) return [];
    const publicPermissions = Array.from(
      new Set(publicRole.permissions.map((rp) => rp.permission.name))
    );
    publicRole.permissions.map((rp) => rp.permission.name);

    return publicPermissions;
  },
  ["publicPermissions"],
  {
    revalidate: false,
    tags: ["publicPermissions"],
  }
);
