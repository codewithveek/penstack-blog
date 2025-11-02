import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { FC } from "react";

interface NewsletterConfirmationProps {
  confirmationUrl: string;
  recipientEmail?: string;
}

export const NewsletterConfirmationTemplate: FC<
  NewsletterConfirmationProps
> = ({ confirmationUrl, recipientEmail }) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your newsletter subscription</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Confirm your subscription</Heading>

          <Section style={section}>
            <Text style={text}>
              Thanks for signing up for our newsletter! Please confirm your
              email address by clicking the button below.
            </Text>

            {recipientEmail && (
              <Text style={text}>Email: {recipientEmail}</Text>
            )}

            <Button
              href={confirmationUrl}
              style={{ ...button, padding: "12px 20px" }}
            >
              Confirm subscription
            </Button>

            <Text style={text}>
              If the button doesn&apos;t work, you can click/copy this link to
              your browser:{" "}
              <Link href={confirmationUrl} style={link}>
                {confirmationUrl}
              </Link>
            </Text>

            <Text style={footer}>
              If you didn&apos;t request this email, you can safely ignore it.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "500",
  color: "#484848",
  padding: "17px 0 0",
  textAlign: "center" as const,
};

const section = {
  padding: "0 48px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
};

const button = {
  backgroundColor: "#4F46E5",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  maxWidth: "240px",
  margin: "24px auto",
};

const link = {
  color: "#4F46E5",
  textDecoration: "underline",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  marginTop: "32px",
};
