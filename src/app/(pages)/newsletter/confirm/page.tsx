import NewsletterConfirm from "@/components//pages/NewsletterPage/Confirm";
import PageWrapper from "@/components//PageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter Confirmation",
  description: "Confirm your newsletter subscription",
};

export default function NewsletterConfirmPage() {
  return (
    <PageWrapper>
      <NewsletterConfirm />
    </PageWrapper>
  );
}
