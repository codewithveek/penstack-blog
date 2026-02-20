import { Spinner, Stack, Text, HStack, Switch, Separator } from "@chakra-ui/react";


import { SectionCard } from "@/components//Dashboard/SectionCard";

import { LuCheck } from "react-icons/lu";
import { CategorySection } from "../../CategorySection";
import { TagsSection } from "../../TagsSection";
import { SEOSection } from "../../SEOSection";
import { ActionButtons } from "../../components/ActionButtons";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { PublishMetadata } from "../../components/PublishMetadata";

export const PublishPanel = () => {
  const isSaving = useEditorPostManagerStore((state) => state.isSaving);
  const autoSave = useEditorPostManagerStore((state) => state.autoSave);
  const isDirty = useEditorPostManagerStore((state) => state.isDirty);
  const setAutosave = useEditorPostManagerStore((state) => state.setAutosave);
  return (
    <Stack gap={3} className="p-0">
      <SectionCard
        title="Appearance"
        roundedTop="none"
        header={
          <HStack separator={<Separator />}>
            <HStack>
              <Text as="span" fontSize={"smaller"} color="gray.500">
                Auto Save:
              </Text>
              <Switch.Root
                checked={autoSave}
                onChange={(e) => setAutosave(!autoSave)}
                size="sm"
              />
            </HStack>
            <HStack>
              <Text
                as="span"
                fontSize={"smaller"}
                color={isSaving ? "gray.300" : undefined}
              >
                {" "}
                {isSaving ? "Saving..." : isDirty ? "Unsaved" : "Saved"}
              </Text>
              {isSaving ? (
                <Spinner size="xs" />
              ) : (
                <Stack
                  align={"center"}
                  justify={"center"}
                  w={"14px"}
                  h={"14px"}
                  rounded="full"
                  bg={isDirty ? "orange.400" : "green.400"}
                >
                  {isDirty && !autoSave ? (
                    <Text fontSize="xs" as={"span"} color="white">
                      !
                    </Text>
                  ) : (
                    <LuCheck size={12} color="white" />
                  )}
                </Stack>
              )}
            </HStack>
          </HStack>
        }
        footer={<ActionButtons />}
      >
        <PublishMetadata />
      </SectionCard>

      <SEOSection />

      <CategorySection />
      <TagsSection />
    </Stack>
  );
};
