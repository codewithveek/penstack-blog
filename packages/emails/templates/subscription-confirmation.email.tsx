/**
 * packages/emails/templates/subscription-confirmation.email.tsx
 *
 * Sent to a member when their paid subscription is confirmed. PRD §16.4
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

export interface SubscriptionConfirmationEmailProps {
  memberName?: string;
  siteName: string;
  siteUrl: string;
  tierName: string;
  amount: string;
  currency: string;
  interval: "month" | "year";
  portalUrl: string;
  logoUrl?: string;
  accentColor?: string;
}

export const SubscriptionConfirmationEmail = ({
  memberName,
  siteName,
  siteUrl,
  tierName,
  amount,
  currency,
  interval,
  portalUrl,
  logoUrl,
  accentColor = "#6366f1",
}: SubscriptionConfirmationEmailProps) => {
  const greeting = memberName ? `Hi ${memberName},` : "Hi there,";
  const intervalLabel = interval === "year" ? "year" : "month";

  return (
    <Html lang="en">
      <Head />
      <Preview>Your {tierName} subscription to {siteName} is confirmed</Preview>
      <Body style={body}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={imgStyle} />
            </Section>
          )}

          <Section style={card}>
            <Heading style={heading}>Subscription Confirmed</Heading>
            <Text style={text}>{greeting}</Text>
            <Text style={text}>
              Thank you for subscribing to <strong>{siteName}</strong>! Your{" "}
              <strong>{tierName}</strong> membership is now active.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLine}>
                <strong>Plan:</strong> {tierName}
              </Text>
              <Text style={detailLine}>
                <strong>Amount:</strong> {currency} {amount}/{intervalLabel}
              </Text>
            </Section>

            <Text style={text}>
              You now have full access to all premium content included in your
              tier.
            </Text>

            <Hr style={hr} />

            <Button style={button(accentColor)} href={siteUrl}>
              Start Reading
            </Button>

            <Text style={smallText}>
              Manage your subscription anytime from your{" "}
              <a href={portalUrl} style={link(accentColor)}>
                member portal
              </a>
              .
            </Text>
          </Section>

          <Text style={footer}>
            &copy; {siteName}. You&apos;re receiving this because you subscribed.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

SubscriptionConfirmationEmail.PreviewProps = {
  memberName: "Jane Doe",
  siteName: "My Blog",
  siteUrl: "https://myblog.com",
  tierName: "Premium",
  amount: "9.00",
  currency: "$",
  interval: "month",
  portalUrl: "https://myblog.com/portal",
} satisfies SubscriptionConfirmationEmailProps;

export default SubscriptionConfirmationEmail;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const body: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const logoSection: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const imgStyle: React.CSSProperties = {
  margin: "0 auto",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "32px",
};

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "0 0 16px",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const detailLine: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#374151",
  margin: "4px 0",
};

const smallText: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: "16px 0 0",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const button = (accent: string): React.CSSProperties => ({
  backgroundColor: accent,
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
});

const link = (accent: string): React.CSSProperties => ({
  color: accent,
  textDecoration: "underline",
});

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
  marginTop: "24px",
};
