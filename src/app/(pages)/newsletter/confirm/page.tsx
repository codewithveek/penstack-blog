import { Suspense } from "react";
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
      <Suspense fallback={<div>Loading...</div>}>
        <NewsletterConfirm />
      </Suspense>
    </PageWrapper>
  );
}
