import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export const VerificationEmail = ({
  verificationLink,
}: {
  verificationLink: string;
}) => (
  <Html>
    <Head />
    <Preview>Verify your email address</Preview>
    <Body style={{ fontFamily: "system-ui" }}>
      <Container>
        <Section>
          <Text>Welcome! Please verify your email address to continue.</Text>
          <Button
            href={verificationLink}
            style={{
              background: "#4F46E5",
              color: "#fff",
              padding: "12px 20px",
              borderRadius: "6px",
            }}
          >
            Verify Email
          </Button>
          <Text>
            if the button above doesn&apos;t work, please copy this link and paste it
            in your browser{" "}
          </Text>
          <Text>{verificationLink}</Text>
          <Text style={{ marginTop: 30, fontSize: 14 }}>
            Valid for 15 minutes.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);
