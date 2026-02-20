import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Img,
  Text,
} from "@react-email/components";
import { PostSelect } from "@/types";
import {
  decodeAndSanitizeHtml,
  generatePostUrl,
  shortenText,
  stripHtml,
} from "@/utils";
import { getSiteUrl, resolveUrl } from "@/utils/url";

interface BlogPostEmailProps {
  post: PostSelect;
  siteName: string;
  siteDescription: string;
  previewText?: string;
}

export const BlogPostNewsletter = ({
  post,
  siteName,
  siteDescription,
  previewText,
}: BlogPostEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {previewText || `New post from ${siteName}: ${post?.title}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {post?.featured_image && (
            <Img
              src={post?.featured_image.url}
              alt={post?.featured_image.alt_text || post?.title || ""}
              style={featuredImage}
            />
          )}

          <Heading style={heading}>{post?.title}</Heading>

          <Text style={authorStyle}>
            By {post?.author.name} •{" "}
            {new Date(post?.published_at!).toLocaleDateString()}
          </Text>
          {post?.summary ? (
            <Section style={excerpt}>
              <Text>{stripHtml(decodeAndSanitizeHtml(post?.summary))}</Text>
            </Section>
          ) : (
            <Section style={excerpt}>
              <Text>
                {shortenText(
                  stripHtml(decodeAndSanitizeHtml(post?.content || "")),
                  200
                )}
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Link
              href={resolveUrl(getSiteUrl(), generatePostUrl(post))}
              style={button}
            >
              Read Full Post
            </Link>
          </Section>

          <Text style={footer}>
            You received this email because you&apos;re subscribed to
            <Link href={getSiteUrl()} style={{ color: "#2B6CB0" }}>
              {siteName}
            </Link>
            .
            <br />
            {siteDescription}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const featuredImage = {
  width: "100%",
  objectFit: "cover" as const,
  marginBottom: "24px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
};

const authorStyle = {
  color: "#666666",
  fontSize: "16px",
  marginBottom: "24px",
};

const excerpt = {
  color: "#444444",
  fontSize: "16px",
  lineHeight: "1.6",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
};

const button = {
  backgroundColor: "#2B6CB0",
  borderRadius: "24px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  marginTop: "32px",
  textAlign: "center" as const,
};

export default BlogPostNewsletter;
