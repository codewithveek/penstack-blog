import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

import { posts } from "./posts.sql";
import { IdGenerator } from "@/utils";
import {
  created_at,
  updated_at,
  id,
  permissionsEnum,
  rolesEnum,
} from "../schema-helper";

export const users = mysqlTable(
  "Users",
  {
    id,
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }),
    bio: varchar("bio", { length: 255 }),
    title: varchar("title", { length: 100 }),
    username: varchar("username", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    social_id: int("social_id"),
    meta_id: int("meta_id"),
    account_status: varchar("account_status", {
      length: 30,
      enum: ["active", "deleted", "banned", "inactive"],
    }).default("active"),
    auth_id: varchar("auth_id", { length: 100 }).$defaultFn(() =>
      IdGenerator.bigIntId()
    ),
    email_verified: boolean("email_verified").default(false),
    auth_type: mysqlEnum("auth_type", [
      "local",
      "google",
      "github",
      "facebook",
    ]).default("local"),
    role_id: int("role_id").notNull(),
    created_at,
    updated_at,
  },
  (table)=>  ([
   index("email_idx").on(table.email),
    index("username_idx").on(table.username),
    index("auth_id_idx").on(table.auth_id),
    index("role_id_idx").on(table.role_id),
  ])
);

export const roles = mysqlTable(
  "Roles",
  {
    id,
    name: mysqlEnum("name", rolesEnum)
      .notNull()
      .unique()
      .$type<(typeof rolesEnum)[number]>(),
    description: varchar("description", { length: 255 }),
  },
  (table)=>  ([
    index("roles_idx_name").on(table.name),
  ])
);

export const permissions = mysqlTable(
  "Permissions",
  {
    id,
    name: mysqlEnum("name", permissionsEnum)
      .notNull()
      .unique()
      .$type<(typeof permissionsEnum)[number]>(),
    description: varchar("description", { length: 255 }),
  },
  (table)=>  ([
    index("permissions_idx_name").on(table.name),
  ])
);

export const userMeta = mysqlTable(
  "UserMeta",
  {
    id,
    user_id: int("user_id").notNull(),
    isProMember: boolean("is_pro_member").default(false),
    lastLogin: timestamp("last_login").default(sql`CURRENT_TIMESTAMP`),
    lastLoginIP: varchar("last_login_ip", { length: 50 }),
    lastLoginLocation: varchar("last_login_location", { length: 255 }),
    lastLoginDevice: varchar("last_login_device", { length: 255 }),
    created_at,
    updated_at,
  },
  (table)=>  ([
    index("user_meta_user_id_idx").on(table.user_id),
  ] )
);

export const userRoles = mysqlTable(
  "UserRoles",
  {
    id,
    user_id: int("user_id").notNull(),
    role_id: int("role_id").notNull(),
  },
  (table)=>  ([
    index("user_role_idx").on(table.user_id, table.role_id),
  ])
);

export const rolePermissions = mysqlTable(
  "RolePermissions",
  {
    id,
    role_id: int("role_id").notNull(),
    permission_id: int("permission_id").notNull(),
  },
  (table)=>  ([
    index("role_permission_idx").on(
      table.role_id,
      table.permission_id
    ),
  ])
);

export const userSocials = mysqlTable(
  "UserSocials",
  {
    id: int("id").primaryKey().autoincrement(),
    user_id: varchar("user_id", { length: 100 }).notNull(),
    github: varchar("github", { length: 100 }),
    facebook: varchar("facebook", { length: 100 }),
    email: varchar("email", { length: 100 }),
    website: varchar("website", { length: 100 }),
    twitter: varchar("twitter", { length: 100 }),
    instagram: varchar("instagram", { length: 100 }),
    linkedin: varchar("linkedin", { length: 100 }),
    youtube: varchar("youtube", { length: 100 }),
    created_at,
    updated_at,
  },
  (table)=>  ([
    index("user_socials_user_id_idx").on(table.user_id),
  ] )
);

export const userMetaRelations = relations(userMeta, ({ one })=>  ({
  user: one(users, {
    fields: [userMeta.user_id],
    references: [users.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one })=>  ({
  user: one(users, {
    fields: [userRoles.user_id],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.role_id],
    references: [roles.id],
  }),
}));

export const RoleRelations = relations(roles, ({ many })=>  ({
  users: many(users),
  permissions: many(rolePermissions),
}));

export const PermissionRelations = relations(permissions, ({ many })=>  ({
  roles: many(rolePermissions),
}));

export const RolePermissionRelations = relations(
  rolePermissions,
  ({ one })=>  ({
    role: one(roles, {
      fields: [rolePermissions.role_id],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permission_id],
      references: [permissions.id],
    }),
  })
);

export const UserRelations = relations(users, ({ many, one })=>  ({
  posts: many(posts),
  socials: one(userSocials, {
    fields: [users.social_id],
    references: [userSocials.id],
  }),
  role: one(roles, {
    fields: [users.role_id],
    references: [roles.id],
  }),
  roles: many(userRoles),
  meta: one(userMeta, {
    fields: [users.meta_id],
    references: [userMeta.id],
  }),
}));
