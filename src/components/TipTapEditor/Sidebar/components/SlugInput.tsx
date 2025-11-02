import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { generateSlug } from "@/utils";
import {
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
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
    <FormControl>
      <FormLabel>URL friendly title:</FormLabel>
      <InputGroup>
        <Input
          placeholder="Slug"
          name="slug"
          value={field}
          autoComplete="off"
          onChange={handleChange}
          isDisabled={!isSlugEditable}
          onBlur={() => setIsSlugEditable(false)}
          rounded="xl"
          pr={1}
        />
        {!isSlugEditable && (
          <InputRightElement roundedRight="xl">
            <Button
              size="sm"
              variant="ghost"
              fontWeight={500}
              onClick={() => setIsSlugEditable(true)}
            >
              Edit
            </Button>
          </InputRightElement>
        )}
      </InputGroup>
    </FormControl>
  );
});

SlugInput.displayName = "SlugInput";
