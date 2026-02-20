import { Field, Group, Input, InputElement, Button } from "@chakra-ui/react";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { generateSlug } from "@/utils";

import { useState, useCallback, ChangeEvent, memo, useEffect } from "react";

export const SlugInput = memo(() => {
  const slug = useEditorPostManagerStore((state) => state.activePost?.slug);
  const [field, setField] = useState(slug);
  const [isSlugEditable, setIsSlugEditable] = useState(false);

  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const handleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const { value } = evt.target;
      const newSlug = generateSlug(value, {
        trim: false,
      });
      setField(newSlug);
      updateField("slug", newSlug);
    },
    [updateField]
  );
  useEffect(() => {
    setField(slug);
  }, [slug]);

  return (
    <Field.Root>
      <Field.Label>URL friendly title:</Field.Label>
      <Group>
        <Input
          placeholder="Slug"
          name="slug"
          value={field}
          autoComplete="off"
          onChange={handleChange}
          disabled={!isSlugEditable}
          onBlur={() => setIsSlugEditable(false)}
          rounded="xl"
          pr={1}
        />
        {!isSlugEditable && (
          <InputElement placement="end" roundedRight="xl">
            <Button
              size="sm"
              variant="ghost"
              fontWeight={500}
              onClick={() => setIsSlugEditable(true)}
            >
              Edit
            </Button>
          </InputElement>
        )}
      </Group>
    </Field.Root>
  );
});

SlugInput.displayName = "SlugInput";
