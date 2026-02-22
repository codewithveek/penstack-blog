/**
 * packages/core/src/db/schema/newsletters.ts
 *
 * Newsletter definitions, member subscriptions to newsletters,
 * email send records and per-recipient tracking, email event logs.
 */

import {
  mysqlTable,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import {
  id,
  createdAt,
  updatedAt,
  siteIdCol,
  newsletterStatusEnum,
  emailSendStatusEnum,
  emailEventTypeEnum,
} from "./helpers.js";
import { sites } from "./sites.js";
import { members } from "./members.js";

// ---------------------------------------------------------------------------
// Newsletters (publication email channels)
// ---------------------------------------------------------------------------

export const newsletters = mysqlTable(
  "newsletters",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    sender_name: varchar("sender_name", { length: 255 }),
    sender_email: varchar("sender_email", { length: 255 }),
    reply_to_email: varchar("reply_to_email", { length: 255 }),
    active: boolean("active").default(true).notNull(),
    /** Whether new members are auto-subscribed to this newsletter */
    subscribe_on_signup: boolean("subscribe_on_signup").default(true).notNull(),
    /** Rendered header and footer HTML for email templates */
    header_html: text("header_html"),
    footer_html: text("footer_html"),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    siteSlugIdx: uniqueIndex("newsletters_site_slug_unique").on(
      t.site_id,
      t.slug
    ),
    siteIdx: index("newsletters_site_id").on(t.site_id),
  })
);

// ---------------------------------------------------------------------------
// Member newsletter subscriptions (many-to-many)
// ---------------------------------------------------------------------------

export const memberNewsletters = mysqlTable(
  "member_newsletters",
  {
    member_id: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    newsletter_id: varchar("newsletter_id", { length: 36 })
      .notNull()
      .references(() => newsletters.id, { onDelete: "cascade" }),
    subscribed_at: timestamp("subscribed_at").notNull(),
  },
  (t) => ({
    pk: uniqueIndex("member_newsletters_pk").on(t.member_id, t.newsletter_id),
    newsletterIdx: index("member_newsletters_newsletter_id").on(
      t.newsletter_id
    ),
  })
);

// ---------------------------------------------------------------------------
// Email sends (one per post–newsletter combination)
// ---------------------------------------------------------------------------

export const emailSends = mysqlTable(
  "email_sends",
  {
    id: id(),
    site_id: siteIdCol().references(() => sites.id, { onDelete: "cascade" }),
    newsletter_id: varchar("newsletter_id", { length: 36 })
      .notNull()
      .references(() => newsletters.id, { onDelete: "cascade" }),
    post_id: varchar("post_id", { length: 36 }),
    subject: varchar("subject", { length: 998 }).notNull(),
    from_email: varchar("from_email", { length: 255 }).notNull(),
    from_name: varchar("from_name", { length: 255 }).notNull(),
    reply_to: varchar("reply_to", { length: 255 }),
    status: emailSendStatusEnum.notNull().default("queued"),
    scheduled_at: timestamp("scheduled_at"),
    sent_at: timestamp("sent_at"),
    recipient_count: int("recipient_count").default(0).notNull(),
    delivered_count: int("delivered_count").default(0).notNull(),
    opened_count: int("opened_count").default(0).notNull(),
    clicked_count: int("clicked_count").default(0).notNull(),
    bounced_count: int("bounced_count").default(0).notNull(),
    failed_count: int("failed_count").default(0).notNull(),
    created_at: createdAt(),
    updated_at: updatedAt(),
  },
  (t) => ({
    siteIdx: index("email_sends_site_id").on(t.site_id),
    statusIdx: index("email_sends_status").on(t.site_id, t.status),
    newsletterIdx: index("email_sends_newsletter_id").on(t.newsletter_id),
  })
);

// ---------------------------------------------------------------------------
// Email send recipients (per-member record)
// ---------------------------------------------------------------------------

export const emailSendRecipients = mysqlTable(
  "email_send_recipients",
  {
    id: id(),
    email_send_id: varchar("email_send_id", { length: 36 })
      .notNull()
      .references(() => emailSends.id, { onDelete: "cascade" }),
    member_id: varchar("member_id", { length: 36 })
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    /** Provider-supplied message ID for tracking */
    provider_message_id: varchar("provider_message_id", { length: 255 }),
    delivered_at: timestamp("delivered_at"),
    opened_at: timestamp("opened_at"),
    clicked_at: timestamp("clicked_at"),
    /** Per-recipient tracking UUID used in unsubscribe / pixel links */
    tracking_id: varchar("tracking_id", { length: 36 }).notNull(),
  },
  (t) => ({
    sendMemberIdx: uniqueIndex("email_send_recipients_send_member").on(
      t.email_send_id,
      t.member_id
    ),
    memberIdx: index("email_send_recipients_member_id").on(t.member_id),
    trackingIdx: uniqueIndex("email_send_recipients_tracking_id").on(
      t.tracking_id
    ),
  })
);

// ---------------------------------------------------------------------------
// Email event log (webhooks from ESP: delivered, opened, clicked, bounced)
// ---------------------------------------------------------------------------

export const emailEvents = mysqlTable(
  "email_events",
  {
    id: id(),
    recipient_id: varchar("recipient_id", { length: 36 })
      .notNull()
      .references(() => emailSendRecipients.id, { onDelete: "cascade" }),
    event_type: emailEventTypeEnum.notNull(),
    occurred_at: timestamp("occurred_at").notNull(),
    metadata: text("metadata"),
  },
  (t) => ({
    recipientIdx: index("email_events_recipient_id").on(t.recipient_id),
    eventTypeIdx: index("email_events_event_type").on(t.event_type),
  })
);

export type Newsletter = typeof newsletters.$inferSelect;
export type NewNewsletter = typeof newsletters.$inferInsert;
export type MemberNewsletter = typeof memberNewsletters.$inferSelect;
export type NewMemberNewsletter = typeof memberNewsletters.$inferInsert;
export type EmailSend = typeof emailSends.$inferSelect;
export type NewEmailSend = typeof emailSends.$inferInsert;
export type EmailSendRecipient = typeof emailSendRecipients.$inferSelect;
export type NewEmailSendRecipient = typeof emailSendRecipients.$inferInsert;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;
