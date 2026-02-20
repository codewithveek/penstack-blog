import { Suspense } from "react";
import SearchResults from "@/components/pages/PostSearchPage";
import PageWrapper from "@/components/PageWrapper";

export default function SearchPage() {
  return (
    <PageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchResults />
      </Suspense>
    </PageWrapper>
  );
}
