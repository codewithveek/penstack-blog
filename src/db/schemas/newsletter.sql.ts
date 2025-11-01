import {
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  index,
} from "drizzle-orm/mysql-core";
import { id, created_at, updated_at, emailEventsEnum } from "../schema-helper";
import { IdGenerator } from "@/utils";

export const newsletterSubscribers = mysqlTable(
  "NewsLetterSubscribers",
  {
    id,
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    status: mysqlEnum("status", ["subscribed", "unsubscribed"])
      .notNull()
      .default("subscribed"),
    verification_status: mysqlEnum("verification_status", [
      "verified",
      "unverified",
    ])
      .notNull()
      .default("unverified"),
    verification_token: varchar("verification_token", { length: 255 }),
    verification_token_expires: timestamp("verification_token_expires"),
    unsubscribed_at: timestamp("unsubscribed_at"),
    referrer: varchar("referrer", { length: 500 }),
    created_at,
    updated_at,
  },
  (table) => ({
    emailIndex: uniqueIndex("email_index").on(table.email),
    verificationTokenIndex: uniqueIndex("verification_token_index").on(
      table.verification_token
    ),
    statusIndex: index("status_index").on(table.status),
    verificationStatusIndex: index("verification_status_index").on(
      table.verification_status
    ),
    createdAtIndex: index("created_at_index").on(table.created_at),
  })
);

export const newsletters = mysqlTable(
  "NewsLetters",
  {
    id,
    content_id: varchar("content_id", { length: 36 })
      .notNull()
      .$defaultFn(() => IdGenerator.uuid()),
    title: varchar("title", { length: 255 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    preview_text: varchar("preview_text", { length: 255 }),
    content: text("content").notNull(),
    status: mysqlEnum("status", ["draft", "scheduled", "sent", "failed"])
      .notNull()
      .default("draft"),
    scheduled_for: timestamp("scheduled_for"),
    sent_at: timestamp("sent_at"),
    resend_email_id: varchar("resend_email_id", { length: 255 }),
    created_at,
    updated_at,
  },
  (table) => ({
    contentIdIndex: uniqueIndex("content_id_index").on(table.content_id),
    statusIndex: index("status_index").on(table.status),
    scheduledForIndex: index("scheduled_for_index").on(table.scheduled_for),
    sentAtIndex: index("sent_at_index").on(table.sent_at),
  })
);

export const newsletterRecipients = mysqlTable(
  "NewsLetterRecipients",
  {
    id,
    newsletter_id: int("newsletter_id").notNull(),
    subscriber_id: int("subscriber_id").notNull(),
    sent_at: timestamp("sent_at"),
    created_at,
  },
  (table) => ({
    newsletterIdIndex: index("newsletter_id_index").on(table.newsletter_id),
    subscriberIdIndex: index("subscriber_id_index").on(table.subscriber_id),
    sentAtIndex: index("sent_at_index").on(table.sent_at),
  })
);

export const emailEvents = mysqlTable(
  "EmailEvents",
  {
    id,
    email_id: varchar("email_id", { length: 255 }).notNull(),
    newsletter_id: int("newsletter_id"),
    subscriber_id: int("subscriber_id"),
    event_type: mysqlEnum("event_type", emailEventsEnum).notNull(),
    event_data: json("event_data"),
    created_at,
  },
  (table) => ({
    emailIdIndex: index("email_id_index").on(table.email_id),
    newsletterIdIndex: index("newsletter_id_index").on(table.newsletter_id),
    subscriberIdIndex: index("subscriber_id_index").on(table.subscriber_id),
    eventTypeIndex: index("event_type_index").on(table.event_type),
    createdAtIndex: index("created_at_index").on(table.created_at),
  })
);
