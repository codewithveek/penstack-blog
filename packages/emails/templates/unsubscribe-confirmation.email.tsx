/**
 * packages/emails/templates/unsubscribe-confirmation.email.tsx
 *
 * Sent to a member after they unsubscribe from a newsletter or cancel
 * their subscription. PRD §16.4
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
  Img,
} from "@react-email/components";
import * as React from "react";

export interface UnsubscribeConfirmationEmailProps {
  memberName?: string;
  siteName: string;
  siteUrl: string;
  /** "newsletter" = email list unsub, "subscription" = paid plan cancelation */
  kind: "newsletter" | "subscription";
  /** Name of the newsletter or tier */
  itemName?: string;
  /** URL to re-subscribe */
  resubscribeUrl?: string;
  logoUrl?: string;
  accentColor?: string;
}

export const UnsubscribeConfirmationEmail = ({
  memberName,
  siteName,
  siteUrl,
  kind,
  itemName,
  resubscribeUrl,
  logoUrl,
  accentColor = "#6366f1",
}: UnsubscribeConfirmationEmailProps) => {
  const greeting = memberName ? `Hi ${memberName},` : "Hi there,";
  const isNewsletter = kind === "newsletter";

  const subject = isNewsletter
    ? itemName
      ? `You've unsubscribed from ${itemName}`
      : `You've unsubscribed from ${siteName}`
    : `Your ${itemName ?? "subscription"} has been cancelled`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={body}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={imgStyle} />
            </Section>
          )}

          <Section style={card}>
            <Heading style={heading}>{subject}</Heading>
            <Text style={text}>{greeting}</Text>

            {isNewsletter ? (
              <>
                <Text style={text}>
                  You&apos;ve been unsubscribed from{" "}
                  <strong>{itemName ?? siteName}</strong>. You will no longer
                  receive emails from this newsletter.
                </Text>
                <Text style={text}>
                  If this was a mistake, you can re-subscribe at any time.
                </Text>
              </>
            ) : (
              <>
                <Text style={text}>
                  Your <strong>{itemName ?? "paid"}</strong> subscription to{" "}
                  <strong>{siteName}</strong> has been cancelled. You will
                  continue to have access until the end of your current billing
                  period.
                </Text>
                <Text style={text}>
                  We&apos;re sorry to see you go. If you change your mind, you
                  can re-subscribe at any time.
                </Text>
              </>
            )}

            {resubscribeUrl && (
              <Button style={button(accentColor)} href={resubscribeUrl}>
                Re-subscribe
              </Button>
            )}

            {!resubscribeUrl && (
              <Button style={button(accentColor)} href={siteUrl}>
                Visit {siteName}
              </Button>
            )}
          </Section>

          <Text style={footer}>
            &copy; {siteName}. You received this to confirm your
            unsubscribe request.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

UnsubscribeConfirmationEmail.PreviewProps = {
  memberName: "Jane Doe",
  siteName: "My Blog",
  siteUrl: "https://myblog.com",
  kind: "newsletter",
  itemName: "Weekly Digest",
  resubscribeUrl: "https://myblog.com/#/portal/newsletters",
} satisfies UnsubscribeConfirmationEmailProps;

export default UnsubscribeConfirmationEmail;

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

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
  marginTop: "24px",
};
