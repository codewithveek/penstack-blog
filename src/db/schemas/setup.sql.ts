import {
    mysqlTable,
    varchar,
    boolean,
    timestamp,
    text,
    int,
} from "drizzle-orm/mysql-core";
import { created_at, id, updated_at } from "../schema-helper";

export const setupStatus = mysqlTable("SetupStatus", {
    id,
    is_completed: boolean("is_completed").default(false).notNull(),
    completed_at: timestamp("completed_at"),
    setup_version: varchar("setup_version", { length: 20 }),
    created_at,
    updated_at,
});

export const oauthProviders = mysqlTable("OAuthProviders", {
    id,
    provider_name: varchar("provider_name", { length: 50 }).notNull().unique(),
    display_name: varchar("display_name", { length: 100 }).notNull(),
    client_id: varchar("client_id", { length: 500 }).notNull(),
    client_secret: text("client_secret").notNull(),
    is_enabled: boolean("is_enabled").default(false).notNull(),
    redirect_uri: varchar("redirect_uri", { length: 500 }),
    scopes: text("scopes"),
    additional_config: text("additional_config"),
    created_at,
    updated_at,
    created_by: varchar("created_by", { length: 255 }),
    updated_by: varchar("updated_by", { length: 255 }),
});

export const oauthProviderAuditLog = mysqlTable("OAuthProviderAuditLog", {
    id,
    provider_id: int("provider_id").notNull(),
    action: varchar("action", { length: 50 }).notNull(),
    changed_by: varchar("changed_by", { length: 255 }).notNull(),
    changes: text("changes"),
    created_at,
});

export const emailServiceConfig = mysqlTable("EmailServiceConfig", {
    id,
    service_type: varchar("service_type", { length: 50 }).notNull(),
    is_active: boolean("is_active").default(false).notNull(),
    api_key: text("api_key"),
    smtp_host: varchar("smtp_host", { length: 255 }),
    smtp_port: int("smtp_port"),
    smtp_user: varchar("smtp_user", { length: 255 }),
    smtp_password: text("smtp_password"),
    smtp_secure: boolean("smtp_secure").default(true),
    from_email: varchar("from_email", { length: 255 }).notNull(),
    from_name: varchar("from_name", { length: 255 }).notNull(),
    additional_config: text("additional_config"),
    created_at,
    updated_at,
});
