import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../src/db";
import {
  categories,
  tags,
  roles,
  permissions,
  rolePermissions,
  users,
  posts,
  siteSettings,
} from "../src/db/schemas";
import { eq, sql } from "drizzle-orm";
import { permissionsEnum, rolesEnum } from "@/db/schema-helper";
import { IdGenerator, isSecretKey } from "@/utils";
import { updateSettings } from "@/lib/queries/settings";
import { DEFAULT_SETTINGS } from "@/lib/queries/settings/config";
import crypto from "crypto";
async function main() {
  try {
    console.log("🌱 Starting seed...");

    console.log("Creating categories...");
    await db
      .insert(categories)
      .values({
        id: 1,
        name: "Uncategorized",
        slug: "uncategorized",
      })
      .onDuplicateKeyUpdate({
        set: { name: "Uncategorized", slug: "uncategorized" },
      });

    console.log("✅Categories created");

    console.log("Creating tags...");
    const seedTags = [
      { name: "Technology", slug: "technology" },

      { name: "Beginner", slug: "beginner" },
      { name: "Programming", slug: "programming" },
    ];

    await Promise.all(
      seedTags.map((tag) =>
        db
          .insert(tags)
          .values(tag)
          .onDuplicateKeyUpdate({
            set: { name: tag.name, slug: tag.slug },
          })
      )
    );
    console.log("✅Tags created");

    const seedRoles = [
      { name: "admin", description: "Full access to all features" },
      { name: "editor", description: "Can edit and publish content" },
      { name: "author", description: "Can create and edit own content" },
      {
        name: "contributor",
        description: "Can create content but not publish",
      },
      {
        name: "moderator",
        description: "Can moderate comments and manage user-generated content",
      },
      {
        name: "seo_manager",
        description: "Focuses on SEO optimization and analytics",
      },
      {
        name: "newsletter_manager",
        description: "Manages newsletter content and subscriptions",
      },
      {
        name: "subscriber",
        description: "Can access premium content and comment",
      },
      {
        name: "public",
        description: "Default role for non-authenticated users",
      },
    ] as { name: (typeof rolesEnum)[number]; description: string }[];

    console.log("Creating roles...");
    const createdRoles = await db.transaction(async (tx) => {
      await tx
        .insert(roles)
        .values(seedRoles)
        .onDuplicateKeyUpdate({
          set: { name: sql`name` },
        })
        .$returningId();
      return await tx.query.roles.findMany({
        columns: { id: true, name: true },
      });
    });

    console.log("✅Roles created", createdRoles);

    const [
      adminRole,
      editorRole,
      authorRole,
      contributorRole,
      moderatorRole,
      seoManagerRole,
      newsletterManagerRole,
      subscriberRole,
      publicRole,
    ] = createdRoles;

    console.log("✅ Roles created:");

    console.log("Creating permissions...");
    const blogPermissions = [
      {
        name: "dashboard:access",
        description: "Can access the dashboard",
      },
      {
        name: "posts:view",
        description: "Can view posts contents in dashboard",
      },
      {
        name: "posts:create",
        description: "Can create new posts",
      },
      {
        name: "posts:edit",
        description: "Can edit existing posts",
      },
      {
        name: "posts:delete",
        description: "Can delete posts",
      },
      {
        name: "posts:publish",
        description: "Can publish posts",
      },
      {
        name: "posts:read",
        description: "Can read posts",
      },
      {
        name: "posts:schedule",
        description: "Can schedule posts for future publication",
      },
      {
        name: "posts:review",
        description: "Can review and approve pending posts",
      },

      {
        name: "users:read",
        description: "Can view users",
      },
      {
        name: "users:edit",
        description: "Can edit users",
      },
      {
        name: "users:write",
        description: "Can create/edit users",
      },
      {
        name: "users:delete",
        description: "Can delete users",
      },
      {
        name: "roles:read",
        description: "Can view roles",
      },
      {
        name: "roles:write",
        description: "Can create/edit roles",
      },
      {
        name: "roles:delete",
        description: "Can delete roles",
      },
      {
        name: "media:upload",
        description: "Can upload media files",
      },
      {
        name: "media:read",
        description: "Can view media files",
      },
      {
        name: "media:delete",
        description: "Can delete media files",
      },
      {
        name: "media:edit",
        description: "Can edit media file properties",
      },
      {
        name: "settings:read",
        description: "Can view system settings",
      },
      {
        name: "settings:write",
        description: "Can modify system settings",
      },
      {
        name: "comments:create",
        description: "Can create comments",
      },
      {
        name: "comments:moderate",
        description: "Can moderate comments",
      },
      {
        name: "comments:delete",
        description: "Can delete comments",
      },
      {
        name: "comments:read",
        description: "Can view comments",
      },
      {
        name: "comments:reply",
        description: "Can reply to comments",
      },

      {
        name: "newsletters:read",
        description: "Can view newsletter settings and subscribers",
      },
      {
        name: "newsletters:write",
        description: "Can create and edit newsletters",
      },
      {
        name: "newsletters:delete",
        description: "Can delete newsletters",
      },
      {
        name: "categories:read",
        description: "Can view post categories",
      },
      {
        name: "categories:create",
        description: "Can create new categories",
      },
      {
        name: "tags:read",
        description: "Can view post tags",
      },
      {
        name: "tags:create",
        description: "Can create new tags",
      },
      {
        name: "pages:read",
        description: "Can view static pages",
      },
      {
        name: "pages:edit",
        description: "Can view static pages",
      },
      {
        name: "pages:delete",
        description: "Can view static pages",
      },
      {
        name: "seo:edit",
        description: "Can edit SEO settings and metadata",
      },
      {
        name: "seo:view",
        description: "Can view SEO settings and analytics",
      },
      {
        name: "analytics:view",
        description: "Can view site analytics and statistics",
      },
      {
        name: "analytics:export",
        description: "Can export analytics data",
      },
      {
        name: "auth:register",
        description: "Can register a new account",
      },
      {
        name: "auth:login",
        description: "Can login to existing account",
      },
    ] as { name: (typeof permissionsEnum)[number]; description: string }[];

    const createdPermissions = await Promise.all(
      blogPermissions.map((permission) =>
        db.transaction(async (tx) => {
          await tx
            .insert(permissions)
            .values({
              name: permission.name,
              description: permission.description,
            })
            .onDuplicateKeyUpdate({
              set: { name: permission.name },
            });
          return tx.query.permissions.findFirst({
            where: eq(permissions.name, permission.name),
          });
        })
      )
    );

    console.log("✅ Permissions created");

    console.log("Assigning permissions to roles...");

    const assignPermissionsToRole = async (
      roleId: number,
      permissionNames: string[]
    ) => {
      const rolePerms = createdPermissions.filter((p) =>
        permissionNames.includes(p?.name as string)
      );

      await Promise.all(
        rolePerms.map((perm) =>
          db
            .insert(rolePermissions)
            .values({
              role_id: roleId,
              permission_id: perm?.id as number,
            })
            .onDuplicateKeyUpdate({
              set: { role_id: roleId, permission_id: perm?.id },
            })
        )
      );
    };

    // Admin gets all permissions
    await assignPermissionsToRole(
      adminRole.id,
      createdPermissions.map((p) => p?.name as string)
    );

    // Editor permissions
    await assignPermissionsToRole(editorRole.id, [
      "dashboard:access",
      "posts:create",
      "posts:edit",
      "posts:delete",
      "posts:publish",
      "posts:read",
      "posts:schedule",
      "posts:review",
      "media:upload",
      "media:read",
      "media:edit",
      "comments:read",
      "comments:create",
      "comments:moderate",
      "comments:delete",
      "categories:read",
      "categories:create",
      "tags:read",
      "tags:create",
      "auth:login",
      "posts:view",
    ]);

    // Author permissions
    await assignPermissionsToRole(authorRole.id, [
      "dashboard:access",
      "posts:create",
      "posts:read",
      "media:upload",
      "media:read",
      "posts:view",
      "comments:create",
      "comments:read",
      "comments:reply",
      "categories:read",
      "tags:read",
      "auth:login",
    ]);

    // Contributor permissions
    await assignPermissionsToRole(contributorRole.id, [
      "dashboard:access",
      "posts:create",
      "posts:read",
      "media:upload",
      "media:read",
      "comments:read",
      "comments:reply",
      "categories:read",
      "tags:read",
      "auth:login",
    ]);
    await assignPermissionsToRole(moderatorRole.id, [
      "dashboard:access",
      "comments:read",
      "comments:moderate",
      "comments:delete",
      "comments:approve",
      "posts:read",
      "auth:login",
    ]);
    await assignPermissionsToRole(seoManagerRole.id, [
      "dashboard:access",
      "seo:edit",
      "seo:view",
      "analytics:view",
      "analytics:export",
      "posts:read",
      "auth:login",
    ]);
    // Subscriber permissions
    await assignPermissionsToRole(subscriberRole.id, [
      "posts:read",
      "comments:create",
      "comments:reply",
      "media:upload",
      "comments:read",
      "auth:login",
    ]);
    await assignPermissionsToRole(newsletterManagerRole.id, [
      "dashboard:access",
      "newsletters:read",
      "newsletters:write",
      "media:upload",
      "media:read",
      "newsletters:delete",
      "posts:read",
      "auth:login",
    ]);
    // Public permissions
    await assignPermissionsToRole(publicRole.id, [
      "posts:read",
      "comments:read",
      "auth:register",
      "auth:login",
    ]);

    console.log("Creating admin user...");
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminPassword || !adminEmail) {
      throw new Error("Admin password or email not provided");
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (!existingAdmin.length) {
      await db.insert(users).values({
        auth_id: IdGenerator.bigIntId(),
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        username: "admin",
        role_id: adminRole.id,
        auth_type: "local",
        title: "Chief Editor",
        email_verified: true,
        bio: "I am the Chief Editor of this blog. I am responsible for overseeing the editorial content and ensuring the quality and accuracy of the articles.",
      });
      const adminUser = await db.query.users.findFirst({
        where: eq(users.email, adminEmail),
      });
      try {
        await db.insert(posts).values({
          title: "Welcome to my blog",
          content: "This is your first post, edit or delete it",
          slug: "welcome-to-my-blog",
          author_id: adminUser?.auth_id as string,
          status: "published",
          category_id: 1,
          post_id: uuidv4(),
          published_at: new Date(),
        });
        console.log("✅ Post created successfully");
      } catch (error) {
        console.log("Error creating post:", error);
      }
    } else {
      console.log("Admin user already exists");
    }
    try {
      const operations = Object.entries(DEFAULT_SETTINGS).map(
        ([key, setting]) => {
          const value =
            isSecretKey(key) &&
            setting.value &&
            !setting.encrypted &&
            setting.canEncrypt
              ? encryptKey(setting.value)
              : setting.value;

          return db
            .insert(siteSettings)
            .values({
              name: setting.name,
              description: setting.description,
              folder: setting.folder as
                | "email"
                | "general"
                | "analytics"
                | "monitoring"
                | "media"
                | "advanced"
                | "social"
                | "misc",
              key,
              value,
              enabled: setting.enabled,
              encrypted: setting.encrypted,
              canEncrypt: setting.canEncrypt,
            })
            .onDuplicateKeyUpdate({
              set: { key, value, updated_at: new Date() },
            });
        }
      );

      for (const operation of operations) {
        await operation;
      }
      console.log("✅ Site settings created successfully");
    } catch (error) {
      console.log("❌ Error creating site settings:", error);
    }
    console.log("✅ Seed completed successfully");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  }
}
export function encryptKey(key: string): string {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not set");
  }
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY as string, "hex");

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    keyBuffer as crypto.CipherKey,
    iv as crypto.BinaryLike
  );

  const encrypted = cipher.update(key, "utf8", "hex") + cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted data + auth tag
  return iv.toString("hex") + encrypted + authTag.toString("hex");
}
main();
