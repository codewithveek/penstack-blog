/**
 * packages/emails/templates/payment-receipt.email.tsx
 *
 * Sent to a member after a successful payment or when a payment fails. PRD §16.4
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

export interface PaymentReceiptEmailProps {
  memberName?: string;
  siteName: string;
  tierName: string;
  amount: string;
  currency: string;
  invoiceDate: string;
  invoiceNumber?: string;
  status: "paid" | "failed";
  portalUrl: string;
  logoUrl?: string;
  accentColor?: string;
  /** Only relevant for failed payments */
  retryUrl?: string;
}

export const PaymentReceiptEmail = ({
  memberName,
  siteName,
  tierName,
  amount,
  currency,
  invoiceDate,
  invoiceNumber,
  status,
  portalUrl,
  logoUrl,
  accentColor = "#6366f1",
  retryUrl,
}: PaymentReceiptEmailProps) => {
  const greeting = memberName ? `Hi ${memberName},` : "Hi there,";
  const isPaid = status === "paid";

  return (
    <Html lang="en">
      <Head />
      <Preview>
        {isPaid
          ? `Payment receipt from ${siteName}`
          : `Payment failed for your ${siteName} subscription`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={siteName} height={40} style={imgStyle} />
            </Section>
          )}

          <Section style={card}>
            <Heading style={heading}>
              {isPaid ? "Payment Receipt" : "Payment Failed"}
            </Heading>
            <Text style={text}>{greeting}</Text>

            {isPaid ? (
              <Text style={text}>
                We&apos;ve received your payment for the{" "}
                <strong>{tierName}</strong> plan on <strong>{siteName}</strong>.
              </Text>
            ) : (
              <Text style={text}>
                We were unable to process your payment for the{" "}
                <strong>{tierName}</strong> plan on <strong>{siteName}</strong>.
                Please update your payment method to continue your subscription.
              </Text>
            )}

            <Section style={detailsBox}>
              <Text style={detailLine}>
                <strong>Amount:</strong> {currency} {amount}
              </Text>
              <Text style={detailLine}>
                <strong>Date:</strong> {invoiceDate}
              </Text>
              {invoiceNumber && (
                <Text style={detailLine}>
                  <strong>Invoice:</strong> {invoiceNumber}
                </Text>
              )}
              <Text style={detailLine}>
                <strong>Status:</strong>{" "}
                <span style={{ color: isPaid ? "#059669" : "#dc2626" }}>
                  {isPaid ? "Paid" : "Failed"}
                </span>
              </Text>
            </Section>

            <Hr style={hr} />

            {isPaid ? (
              <Button style={button(accentColor)} href={portalUrl}>
                View Portal
              </Button>
            ) : (
              <Button
                style={button("#dc2626")}
                href={retryUrl ?? portalUrl}
              >
                Update Payment Method
              </Button>
            )}
          </Section>

          <Text style={footer}>
            &copy; {siteName}. You&apos;re receiving this because you have an
            active subscription.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

PaymentReceiptEmail.PreviewProps = {
  memberName: "Jane Doe",
  siteName: "My Blog",
  tierName: "Premium",
  amount: "9.00",
  currency: "$",
  invoiceDate: "February 23, 2026",
  invoiceNumber: "INV-2026-0042",
  status: "paid",
  portalUrl: "https://myblog.com/portal",
} satisfies PaymentReceiptEmailProps;

export default PaymentReceiptEmail;

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

const hr: React.CSSProperties = {
  borderColor: "#e5e5e5",
  margin: "24px 0",
};

const button = (bgColor: string): React.CSSProperties => ({
  backgroundColor: bgColor,
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
