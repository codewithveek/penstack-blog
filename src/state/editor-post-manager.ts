import { create } from "zustand";
import { PostInsert, PostSelectForEditing } from "../types";
import debounce from "lodash/debounce";
import axios from "axios";
import { generateSlug } from "../utils";
import isEqual from "lodash/isEqual";
import isEmpty from "just-is-empty";

type EditorPostManagerState = {
  activePost: PostSelectForEditing | null;
  isDirty: boolean;
  isSaving: boolean;
  hasError: boolean;
  lastUpdate: string | Date | null;
  autoSave: boolean;
};

type EditorPostManagerActions = {
  setAutosave: (enabled: boolean) => void;
  setPost: (post: PostSelectForEditing | null) => void;
  updateField: <K extends keyof PostInsert>(
    key: K,
    value: PostInsert[K],
    shouldAutosave?: boolean,
    updateSlug?: boolean
  ) => void;
  savePost: () => Promise<void>;
  setIsSaving: (isSaving: boolean) => void;
  setIsDirty: (isDirty: boolean) => void;
  setHasError: (hasError: boolean) => void;
};

export const useEditorPostManagerStore = create<
  EditorPostManagerState & EditorPostManagerActions
>((set, get) => {
  // Keep track of the original post data for comparison
  let originalPost: PostInsert | null = null;

  const debouncedSave = debounce(
    async (postData: PostInsert, canSave: boolean = false) => {
      try {
        if (!originalPost) return;

        set({ isSaving: true });
        const { autoSave } = get();

        // Only include fields that have changed from original values
        const changedValues: Partial<PostInsert> = {};
        Object.keys(postData).forEach((key) => {
          const currentValue = postData[key as keyof PostInsert];
          const originalValue = originalPost?.[key as keyof PostInsert];

          // Only include if value has changed from original and is not undefined
          if (
            !isEqual(currentValue, originalValue) &&
            currentValue !== undefined
          ) {
            (changedValues as any)[key as keyof PostInsert] = currentValue;
          }
        });

        // If no changes, skip everything
        if (isEmpty(changedValues)) {
          set({ isDirty: false, isSaving: false });
          return;
        }

        // If autosave is disabled and not manually saving, just mark as dirty
        if (!autoSave && !canSave) {
          set({ isDirty: true, isSaving: false });
          return;
        }

        // Perform the actual save to server
        const { status, data } = await axios.put<{
          data: NonNullable<PostSelectForEditing>;
          message: string;
          lastUpdate: string | Date;
        }>(`/api/posts/${postData.post_id}`, {
          generate_toc: postData.generate_toc,
          status: postData.status,
          toc_depth: postData.toc_depth,
          ...changedValues,
        });

        if (status < 200 || status >= 300) {
          throw new Error("Failed to update post");
        }

        const responsePost = data.data;

        // Update the original post with the saved values
        originalPost = {
          ...originalPost,
          ...responsePost,
          author_id: responsePost.author_id,
        };

        set((state) => ({
          activePost: {
            ...state.activePost,
            ...responsePost,
            author_id: responsePost.author_id,
          },
          lastUpdate: data.lastUpdate,
          isDirty: false,
          hasError: false,
          isSaving: false,
        }));
      } catch (error) {
        set({ isDirty: true, hasError: true, isSaving: false });
        console.error("Error saving post:", error);
      }
    },
    1000
  );

  return {
    activePost: null,
    isDirty: false,
    isSaving: false,
    hasError: false,
    lastUpdate: null,
    autoSave: true,

    setAutosave: (enabled) => {
      set({ autoSave: enabled });
    },

    setPost: (post) => {
      // Store the original post data for future comparisons
      originalPost = post || null;

      set({
        activePost: post || null,
        isDirty: false, // Reset dirty state when setting a new post
        hasError: false, // Reset error state
      });
    },

    updateField: (key, value, shouldAutosave = true, updateSlug = false) => {
      const currentPost = get().activePost;
      const { autoSave } = get();
      if (!currentPost) return;

      const newPost = { ...currentPost, [key]: value };

      if (key === "title" && updateSlug) {
        newPost.slug = generateSlug(value as string);
      }

      // Only mark as dirty if value has actually changed from original
      const isDirty =
        !originalPost ||
        !isEqual(
          newPost[key as keyof PostSelectForEditing],
          originalPost[key]
        ) ||
        (updateSlug && !isEqual(newPost.slug, originalPost.slug));

      // Always update state with new data
      set({ activePost: newPost, isDirty });

      // Only trigger save if autosave is enabled and shouldAutosave is true
      if (autoSave && shouldAutosave && isDirty) {
        debouncedSave(newPost);
      }
    },

    savePost: async () => {
      const { activePost: post, isDirty } = get();
      if (post && isDirty) {
        await debouncedSave(post, true);
      }
    },

    setIsSaving: (isSaving) => set({ isSaving }),
    setIsDirty: (isDirty) => set({ isDirty }),
    setHasError: (hasError) => set({ hasError }),
  };
});
