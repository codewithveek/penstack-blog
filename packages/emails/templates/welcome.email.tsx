/**
 * packages/emails/templates/welcome.email.tsx
 *
 * Sent to new members on first subscription. PRD §16.4
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
} from "@react-email/components";
import * as React from "react";

export interface WelcomeEmailProps {
  memberName?: string;
  siteName: string;
  siteUrl: string;
  /** URL to the member portal */
  portalUrl: string;
  logoUrl?: string;
  accentColor?: string;
  /** Short blurb about the newsletter / site (1–2 sentences) */
  tagline?: string;
}

export const WelcomeEmail = ({
  memberName,
  siteName,
  siteUrl,
  portalUrl,
  logoUrl,
  accentColor = "#6366f1",
  tagline,
}: WelcomeEmailProps) => {
  const greeting = memberName ? `Welcome, ${memberName}!` : "Welcome aboard!";

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to {siteName} — you&apos;re all set!</Preview>
      <Body style={body}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={imgStyle} />
            </Section>
          )}

          <Section style={hero(accentColor)}>
            <Heading style={heroHeading}>{greeting}</Heading>
            <Text style={heroSubtext}>
              You&apos;re now a member of <strong>{siteName}</strong>.
            </Text>
          </Section>

          <Section style={content}>
            {tagline && <Text style={text}>{tagline}</Text>}
            <Text style={text}>
              You&apos;ll receive new posts directly in your inbox. You can
              manage your subscription preferences at any time from your member
              portal.
            </Text>

            <Section style={btnContainer}>
              <Button href={portalUrl} style={btn(accentColor)}>
                Visit my portal
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={finePrint}>
              You subscribed at{" "}
              <a href={siteUrl} style={linkStyle}>
                {siteUrl}
              </a>
              . If you didn&apos;t subscribe, you can safely ignore this email —
              you won&apos;t receive any further messages.
            </Text>
          </Section>

          <Section style={footerSection}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

WelcomeEmail.PreviewProps = {
  memberName: "Jane Doe",
  siteName: "My Blog",
  siteUrl: "https://myblog.com",
  portalUrl: "https://myblog.com/portal",
  accentColor: "#6366f1",
  tagline: "We write about software, design and the web.",
} satisfies WelcomeEmailProps;

export default WelcomeEmail;

// ── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "580px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const logoSection: React.CSSProperties = { padding: "24px 40px 0" };
const imgStyle: React.CSSProperties = { display: "block" };

const hero = (accentColor: string): React.CSSProperties => ({
  backgroundColor: accentColor,
  padding: "40px 40px 32px",
});

const heroHeading: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const heroSubtext: React.CSSProperties = {
  color: "rgba(255,255,255,0.85)",
  fontSize: "16px",
  margin: "0",
};

const content: React.CSSProperties = { padding: "40px 40px 32px" };

const text: React.CSSProperties = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
};

const btnContainer: React.CSSProperties = {
  textAlign: "center",
  margin: "32px 0",
};

const btn = (accentColor: string): React.CSSProperties => ({
  backgroundColor: accentColor,
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 32px",
});

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const finePrint: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
};

const linkStyle: React.CSSProperties = { color: "#6366f1" };

const footerSection: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderTop: "1px solid #e5e7eb",
  padding: "20px 40px",
};

const footerText: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center",
  margin: "0",
};
