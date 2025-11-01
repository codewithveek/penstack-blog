import { SectionCard } from "@/components//Dashboard/SectionCard";
import { PillInput } from "@/components//PillInput";
import { usePostSeoMetaStore } from "@/state/post-seo-meta";
import { MediaResponse } from "@/types";
import {
  FormControl,
  Input,
  FormLabel,
  Textarea,
  Stack,
  FormHelperText,
  Box,
  Button,
} from "@chakra-ui/react";
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
  const isLoading = usePostSeoMetaStore((state) => state.isLoading);
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
      <SectionCard title="SEO Metadata" roundedTop={"0"}>
        <Stack gap={3} px={4} py={3}>
          <FormControl>
            <FormLabel>Meta Title</FormLabel>
            <Input
              placeholder="Enter title for SEO"
              value={title}
              onChange={(e) => setKeyValue("title", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Meta Description</FormLabel>
            <Textarea
              placeholder="Enter meta description for SEO"
              maxLength={160}
              maxH={100}
              value={description}
              onChange={(e) => setKeyValue("description", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Canonical URL</FormLabel>
            <FormHelperText mb={2}>
              If this post is published on a different platform, enter the URL
              of the post.
            </FormHelperText>
            <Input
              placeholder="https://example.com/post-title"
              value={canonicalUrl}
              onChange={(e) => setKeyValue("canonical_url", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Image</FormLabel>
            <FormHelperText mb={2}>
              The image will be used as the open graph image for the post.
            </FormHelperText>
            <ImageUploadAndPreview />
          </FormControl>
          <FormControl>
            <FormLabel>Keywords</FormLabel>
            <FormHelperText mb={2}>
              Enter keywords for SEO. Separate with commas.
            </FormHelperText>
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
          </FormControl>
          <Box mt={4}>
            <Button
              isLoading={isSaving}
              isDisabled={isLoading || isSaving || !hasChanges}
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
