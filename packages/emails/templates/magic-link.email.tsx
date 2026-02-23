/**
 * packages/emails/templates/magic-link.email.tsx
 *
 * Transactional email sent to members (and admins) when they request
 * a magic link login. PRD §7.3
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

export interface MagicLinkEmailProps {
  /** Recipient name (optional) */
  recipientName?: string;
  /** The full magic-link URL including the token */
  magicLinkUrl: string;
  /** Site name shown in the email */
  siteName: string;
  /** Token expiry in minutes (default 15) */
  expiryMinutes?: number;
  /** Site logo URL (optional) */
  logoUrl?: string;
  /** Accent colour (hex, e.g. "#6366f1") */
  accentColor?: string;
}

const baseUrl = "https://example.com"; // overridden at render time via props

export const MagicLinkEmail = ({
  recipientName,
  magicLinkUrl,
  siteName,
  expiryMinutes = 15,
  logoUrl,
  accentColor = "#6366f1",
}: MagicLinkEmailProps) => {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        Your magic login link for {siteName} — expires in {expiryMinutes}{" "}
        minutes
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Logo */}
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={logo} />
            </Section>
          )}

          {/* Header */}
          <Section style={header(accentColor)}>
            <Heading style={headerText}>{siteName}</Heading>
          </Section>

          {/* Body */}
          <Section style={contentSection}>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Click the button below to sign in to <strong>{siteName}</strong>.
              This link is valid for <strong>{expiryMinutes} minutes</strong>{" "}
              and can only be used once.
            </Text>

            <Section style={btnContainer}>
              <Button href={magicLinkUrl} style={btn(accentColor)}>
                Sign in to {siteName}
              </Button>
            </Section>

            <Text style={text}>
              If you didn&apos;t request this link, you can safely ignore this
              email. Someone may have typed your email address by mistake.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If the button doesn&apos;t work, copy and paste this URL into your
              browser:
            </Text>
            <Text style={link}>{magicLinkUrl}</Text>
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

MagicLinkEmail.PreviewProps = {
  recipientName: "Jane Doe",
  magicLinkUrl: `${baseUrl}/magic-link?token=preview-token-123`,
  siteName: "My Blog",
  expiryMinutes: 15,
  accentColor: "#6366f1",
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;

// ── Styles ─────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "580px",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const logoSection: React.CSSProperties = {
  padding: "24px 40px 0",
};

const logo: React.CSSProperties = {
  display: "block",
};

const header = (accentColor: string): React.CSSProperties => ({
  backgroundColor: accentColor,
  padding: "32px 40px",
});

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  lineHeight: "1.3",
};

const contentSection: React.CSSProperties = {
  padding: "40px 40px 32px",
};

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

const footer: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 4px",
};

const link: React.CSSProperties = {
  color: "#6366f1",
  fontSize: "12px",
  wordBreak: "break-all",
  margin: "0",
};

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
