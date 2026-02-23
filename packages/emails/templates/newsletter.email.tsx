/**
 * packages/emails/templates/newsletter.email.tsx
 *
 * Used to send newsletter emails to subscribers. PRD §15.2
 * Renders a list of posts (post-digest style) with an optional intro.
 */

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Img,
  Link,
} from "@react-email/components";
import * as React from "react";

export interface NewsletterPostItem {
  title: string;
  excerpt?: string;
  url: string;
  featureImage?: string;
  readingTimeMinutes?: number;
  authorName?: string;
}

export interface NewsletterEmailProps {
  /** Newsletter / site name */
  siteName: string;
  /** Newsletter subject line (also used as preview text) */
  subject: string;
  /** Optional introductory text shown before the post list */
  intro?: string;
  posts: NewsletterPostItem[];
  /** Link to subscriber member portal (for unsubscribe) */
  unsubscribeUrl: string;
  /** Link to view in browser */
  webUrl?: string;
  logoUrl?: string;
  accentColor?: string;
  /** Sender name shown in footer */
  senderName?: string;
}

export const NewsletterEmail = ({
  siteName,
  subject,
  intro,
  posts,
  unsubscribeUrl,
  webUrl,
  logoUrl,
  accentColor = "#6366f1",
  senderName,
}: NewsletterEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header(accentColor)}>
            {logoUrl ? (
              <Img src={logoUrl} alt={siteName} height={36} style={logoImg} />
            ) : (
              <Heading style={siteTitleStyle}>{siteName}</Heading>
            )}
            {webUrl && (
              <Text style={viewInBrowser}>
                <Link href={webUrl} style={viewInBrowserLink}>
                  View in browser
                </Link>
              </Text>
            )}
          </Section>

          {/* Intro */}
          {intro && (
            <Section style={introSection}>
              <Text style={introText}>{intro}</Text>
              <Hr style={hr} />
            </Section>
          )}

          {/* Posts */}
          <Section style={postsSection}>
            {posts.map((post, index) => (
              <React.Fragment key={index}>
                {post.featureImage && (
                  <Img
                    src={post.featureImage}
                    alt={post.title}
                    style={featureImageStyle}
                    width={540}
                  />
                )}
                <Heading style={postTitle}>
                  <Link href={post.url} style={postTitleLink(accentColor)}>
                    {post.title}
                  </Link>
                </Heading>
                {post.excerpt && <Text style={excerpt}>{post.excerpt}</Text>}
                <Text style={meta}>
                  {[
                    post.authorName,
                    post.readingTimeMinutes
                      ? `${post.readingTimeMinutes} min read`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                <Section style={readMoreContainer}>
                  <Button href={post.url} style={readMoreBtn(accentColor)}>
                    Read more →
                  </Button>
                </Section>
                {index < posts.length - 1 && <Hr style={postDivider} />}
              </React.Fragment>
            ))}
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Hr style={hr} />
            <Text style={footerText}>
              You&apos;re receiving this because you subscribed to{" "}
              <strong>{siteName}</strong>
              {senderName ? ` by ${senderName}` : ""}.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={unsubLink}>
                Unsubscribe
              </Link>{" "}
              · Manage preferences
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

NewsletterEmail.PreviewProps = {
  siteName: "My Blog",
  subject: "This week on My Blog",
  intro: "Here's what we published this week.",
  posts: [
    {
      title: "Getting started with TypeScript",
      excerpt:
        "A comprehensive guide to TypeScript fundamentals for JavaScript developers.",
      url: "https://myblog.com/typescript-intro",
      readingTimeMinutes: 8,
      authorName: "Jane Doe",
    },
    {
      title: "Building an API with Hono",
      excerpt: "Hono is a fast, lightweight framework for building web APIs.",
      url: "https://myblog.com/hono-api",
      readingTimeMinutes: 5,
      authorName: "John Smith",
    },
  ],
  unsubscribeUrl: "https://myblog.com/portal/unsubscribe?token=preview",
  accentColor: "#6366f1",
} satisfies NewsletterEmailProps;

export default NewsletterEmail;

// ── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const header = (accentColor: string): React.CSSProperties => ({
  backgroundColor: accentColor,
  padding: "24px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const logoImg: React.CSSProperties = { display: "block" };

const siteTitleStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0",
};

const viewInBrowser: React.CSSProperties = {
  textAlign: "right",
  margin: "0",
  fontSize: "12px",
};

const viewInBrowserLink: React.CSSProperties = {
  color: "rgba(255,255,255,0.75)",
  textDecoration: "underline",
};

const introSection: React.CSSProperties = { padding: "32px 40px 0" };

const introText: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
};

const postsSection: React.CSSProperties = { padding: "24px 40px" };

const featureImageStyle: React.CSSProperties = {
  borderRadius: "6px",
  marginBottom: "16px",
  maxWidth: "100%",
};

const postTitle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 8px",
  lineHeight: "1.3",
};

const postTitleLink = (accentColor: string): React.CSSProperties => ({
  color: "#111827",
  textDecoration: "none",
});

const excerpt: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 8px",
};

const meta: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  margin: "0 0 16px",
};

const readMoreContainer: React.CSSProperties = { marginBottom: "8px" };

const readMoreBtn = (accentColor: string): React.CSSProperties => ({
  backgroundColor: "transparent",
  border: `2px solid ${accentColor}`,
  borderRadius: "6px",
  color: accentColor,
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 20px",
});

const postDivider: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footerSection: React.CSSProperties = { padding: "0 40px 32px" };

const footerText: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  textAlign: "center",
  margin: "0 0 4px",
};

const unsubLink: React.CSSProperties = { color: "#6b7280" };

const footerCopyright: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center",
  margin: "8px 0 0",
};
