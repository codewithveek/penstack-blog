import { MediaResponse } from "@/types";
import { Box, Flex, HStack, IconButton, Image, Stack, Text, Tooltip, Button } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import isEmpty from "just-is-empty";
import { useCallback, useState } from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { MediaModal } from "@/components/Dashboard/Medias/MediaModal";

interface ImageCardProps {
  image: string;
  onImageRemove?: () => void;
  onImageSelect: (media: MediaResponse) => void;
}
export const ImageCard = ({
  image,
  onImageSelect,
  onImageRemove,
}: ImageCardProps) => {
  const borderColor = useColorModeValue("gray.400", "gray.700");
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const textColor = useColorModeValue("gray.500", "gray.200");
  const [featuredImage, setFeaturedImage] = useState<string | null>(image);
  const [open, setOpen] = useState(false);

  const onImageSelectCb = useCallback(
    (media: MediaResponse) => {
      onImageSelect(media);
    },
    [onImageSelect]
  );
  const handleImageSelect = useCallback(
    (media: MediaResponse | MediaResponse[]) => {
      if (Array.isArray(media)) {
        if (media.length > 0) {
          setFeaturedImage(media[0].preview || media[0].url);
          onImageSelectCb(media[0]);
        }
      } else {
        setFeaturedImage(media?.preview || media?.url);
        onImageSelectCb(media);
      }
    },
    []
  );
  const onImageRemoveCb = useCallback(() => {
    onImageRemove?.();
  }, [onImageRemove]);
  const handleImageRemove = useCallback(() => {
    setFeaturedImage(null);
    onImageRemoveCb();
  }, [onImageRemoveCb]);
  return (
    <Box mb={3}>
      <Flex
        mb={3}
        pos="relative"
        borderWidth={isEmpty(featuredImage) ? "1px" : "0"}
        borderStyle={isEmpty(featuredImage) ? "dashed" : "none"}
        borderColor={isEmpty(featuredImage) ? borderColor : "transparent"}
        bg={bgColor}
        rounded="md"
        h="157.5px"
        w="full"
        aspectRatio="2:1"
        maxW="350px"
      >
        {!isEmpty(featuredImage) ? (
          <>
            <Image
              src={featuredImage || ""}
              alt={"featured image"}
              h="100%"
              w="full"
              objectFit="cover"
            />
            <Tooltip.Root content="Remove image" hasArrow placement="top" rounded="md">
              <IconButton
                zIndex={9}
                pos="absolute"
                top={1}
                right={2}
                aria-label="Remove featured image"
                size="sm"
                colorPalette="red"
                onClick={handleImageRemove}
              >
                <LuTrash2 />
              </IconButton>
            </Tooltip.Root>
          </>
        ) : (
          <Stack justify="center" align="center" h="100%" w="full">
            <Text
              px={2}
              as="span"
              color={textColor}
              fontSize="14px"
              fontWeight={500}
              textAlign="center"
            >
              (Recommended size: 1200x630)
            </Text>
          </Stack>
        )}
      </Flex>
      <HStack justify={"flex-end"}>
        <Button
          size="sm"
          onClick={onOpen}
          variant={"ghost"}
          rounded="full"
          // w="full"
        >
          {!featuredImage && <LuPlus size={18} />}
          <Text as="span">{image ? "Change image" : "Add image"}</Text>
        </Button>
      </HStack>

      <MediaModal
        onOpenChange={onOpenChange}
        open={open}
        maxSelection={1}
        defaultFilters={{ type: "image" }}
        onSelect={handleImageSelect}
      />
    </Box>
  );
};

ImageCard.displayName = "ImageCard";
