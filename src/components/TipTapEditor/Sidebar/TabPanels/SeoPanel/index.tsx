import { Field, Input, Textarea, Stack, Box, Button, Text } from "@chakra-ui/react";
import { SectionCard } from "@/components//Dashboard/SectionCard";
import { PillInput } from "@/components//PillInput";
import { usePostSeoMetaStore } from "@/state/post-seo-meta";
import { MediaResponse } from "@/types";

import { useEffect, useRef } from "react";
import { ImageCard } from "@/components/TipTapEditor/Sidebar/components/ImageCard";

export const SeoPanel = () => {
  const fetchSeoMeta = usePostSeoMetaStore((state) => state.fetchSeoMeta);
  const isFetched = useRef(false);
  const title = usePostSeoMetaStore((state) => state.title);
  const description = usePostSeoMetaStore((state) => state.description);
  const canonicalUrl = usePostSeoMetaStore((state) => state.canonical_url);
  const keywords = usePostSeoMetaStore((state) => state.keywords);
  const setKeyValue = usePostSeoMetaStore((state) => state.setKeyValue);
  const saveSeoMeta = usePostSeoMetaStore((state) => state.saveSeoMeta);
  const isLoading = usePostSeoMetaStore((state) => state.loading);
  const isSaving = usePostSeoMetaStore((state) => state.isSaving);
  const hasChanges = usePostSeoMetaStore((state) => state.hasChanges);
  useEffect(() => {
    if (!isFetched.current) {
      fetchSeoMeta();
      isFetched.current = true;
    }
  }, [fetchSeoMeta]);
  return (
    <Stack gap={3} className="p-0">
      <SectionCard
        title="SEO Metadata"
        header={
          <Text color={hasChanges ? "red.500" : "gray.500"} fontSize="sm">
            {hasChanges ? "Unsaved Changes" : ""}
          </Text>
        }
        roundedTop={"0"}
      >
        <Stack gap={3} px={4} py={3}>
          <Field.Root>
            <Field.Label>Meta Title</Field.Label>
            <Input
              placeholder="Enter title for SEO"
              value={title}
              onChange={(e) => setKeyValue("title", e.target.value)}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Meta Description</Field.Label>
            <Textarea
              placeholder="Enter meta description for SEO"
              maxLength={160}
              maxH={100}
              value={description}
              onChange={(e) => setKeyValue("description", e.target.value)}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Canonical URL</Field.Label>
            <Field.HelperText mb={2}>
              If this post is published on a different platform, enter the URL
              of the post.
            </Field.HelperText>
            <Input
              placeholder="https://example.com/post-title"
              value={canonicalUrl}
              onChange={(e) => setKeyValue("canonical_url", e.target.value)}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Image</Field.Label>
            <Field.HelperText mb={2}>
              The image will be used as the open graph image for the post.
            </Field.HelperText>
            <ImageUploadAndPreview />
          </Field.Root>
          <Field.Root>
            <Field.Label>Keywords</Field.Label>
            <Field.HelperText mb={2}>
              Enter keywords for SEO. Separate with commas.
            </Field.HelperText>
            <PillInput
              placeholder="Enter keywords for SEO"
              value={keywords}
              onPillAdd={(pill, allPills) => {
                setKeyValue("keywords", allPills);
              }}
              onPillRemove={(pill, allPills, index) => {
                setKeyValue("keywords", allPills);
              }}
            />
          </Field.Root>
          <Box mt={4}>
            <Button
              loading={isSaving}
              disabled={loading || isSaving || !hasChanges}
              loadingText={"Saving changes.."}
              onClick={() => {
                saveSeoMeta();
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Stack>
      </SectionCard>
    </Stack>
  );
};
const ImageUploadAndPreview = () => {
  const image = usePostSeoMetaStore((state) => state.image);
  const setKeyValue = usePostSeoMetaStore((state) => state.setKeyValue);
  const handleImageSelect = (media: MediaResponse) => {
    setKeyValue("image", media.url);
  };
  const handleImageRemove = () => {
    setKeyValue("image", "");
  };
  return (
    <>
      <ImageCard
        image={image || ""}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
      />
    </>
  );
};
ImageUploadAndPreview.displayName = "ImageUploadAndPreview";
