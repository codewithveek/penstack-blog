/**
 * packages/emails/templates/new-member-notification.email.tsx
 *
 * Sent to the site owner/admin when a new member signs up. PRD §16.4
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

export interface NewMemberNotificationEmailProps {
  memberName: string;
  memberEmail: string;
  siteName: string;
  adminUrl: string;
  logoUrl?: string;
  accentColor?: string;
  memberCount?: number;
}

export const NewMemberNotificationEmail = ({
  memberName,
  memberEmail,
  siteName,
  adminUrl,
  logoUrl,
  accentColor = "#6366f1",
  memberCount,
}: NewMemberNotificationEmailProps) => {
  return (
    <Html lang="en">
      <Head />
      <Preview>New member: {memberName} just joined {siteName}</Preview>
      <Body style={body}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={imgStyle} />
            </Section>
          )}

          <Section style={card}>
            <Heading style={heading}>New member joined!</Heading>
            <Text style={text}>
              <strong>{memberName}</strong> ({memberEmail}) just signed up as a
              member of <strong>{siteName}</strong>.
            </Text>

            {memberCount !== undefined && (
              <Text style={statText}>
                You now have <strong>{memberCount}</strong> total members.
              </Text>
            )}

            <Hr style={hr} />

            <Button style={button(accentColor)} href={`${adminUrl}/members`}>
              View Members
            </Button>
          </Section>

          <Text style={footer}>
            You&apos;re receiving this because you&apos;re an admin of {siteName}.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

NewMemberNotificationEmail.PreviewProps = {
  memberName: "Jane Doe",
  memberEmail: "jane@example.com",
  siteName: "My Blog",
  adminUrl: "https://myblog.com/admin",
  memberCount: 42,
} satisfies NewMemberNotificationEmailProps;

export default NewMemberNotificationEmail;

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

const statText: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#6b7280",
  margin: "0 0 16px",
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

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#999",
  textAlign: "center" as const,
  marginTop: "24px",
};
