/**
 * packages/emails/templates/index.ts
 *
 * Barrel export for all email templates.
 */

export { MagicLinkEmail } from "./magic-link.email";
export type { MagicLinkEmailProps } from "./magic-link.email";

export { WelcomeEmail } from "./welcome.email";
export type { WelcomeEmailProps } from "./welcome.email";

export { NewsletterEmail } from "./newsletter.email";
export type { NewsletterEmailProps, NewsletterPostItem } from "./newsletter.email";
