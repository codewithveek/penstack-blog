import { create } from "zustand";

import debounce from "lodash/debounce";
import isEqual from "lodash/isEqual";
import isEmpty from "just-is-empty";
import { type DebouncedFunc } from "lodash";

type PostSeoMeta = {
  title: string;
  description: string;
  image: string;
  post_id: number | null;
  keywords?: string[];
  canonical_url?: string;
  postIdOrSlug: string | null;
};

type PostSeoMetaOpts = {
  isSaving: boolean;
  error: string | null;
  isLoading: boolean;
  hasChanges: boolean;
};

type PostSeoMetaActions = {
  saveSeoMeta: DebouncedFunc<() => Promise<void>>;
  setPostIdOrSlug: (postIdOrSlug: string) => void;
  fetchSeoMeta: () => Promise<void>;
  setKeyValue: <K extends keyof PostSeoMeta>(
    key: K,
    value: PostSeoMeta[K]
  ) => void;
  setSeoMetaOpts: <K extends keyof PostSeoMetaOpts>(
    key: K,
    value: PostSeoMetaOpts[K]
  ) => void;
};

export const usePostSeoMetaStore = create<
  PostSeoMetaActions & PostSeoMeta & PostSeoMetaOpts
>((set, get) => {
  let initialValues: PostSeoMeta | null = null;

  const debouncedSave = debounce(async () => {
    const state = get();
    const {
      title,
      description,
      image,
      keywords,
      canonical_url,
      postIdOrSlug,
      post_id,
    } = state;

    const postSeoData = {
      title,
      description,
      image,
      keywords,
      canonical_url,
      post_id,
      postIdOrSlug,
    };

    if (!postIdOrSlug) {
      set({ error: "Post ID or slug is required to save SEO meta." });
      return;
    }

    const changedValues: Partial<PostSeoMeta> = {};
    Object.keys(postSeoData).forEach((key) => {
      const currentValue = postSeoData[key as keyof PostSeoMeta];
      const originalValue = initialValues?.[key as keyof PostSeoMeta];

      // Include value if it has changed from original (including null values for clearing fields)
      if (!isEqual(currentValue, originalValue) && !isEmpty(currentValue)) {
        (changedValues as any)[key as keyof PostSeoMeta] = currentValue;
      }
    });

    // If no changes, skip the API call
    if (isEmpty(changedValues)) {
      set({ isSaving: false });
      return;
    }

    set({ isSaving: true });

    try {
      const response = await fetch(`/api/posts/${postIdOrSlug}/seometa`, {
        method: "POST",
        body: JSON.stringify(changedValues),
      });

      if (!response.ok) {
        throw new Error("Failed to save SEO meta");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const updatedValues = {
        post_id: data.data.post_id,
        title: data.data.title,
        description: data.data.description,
        image: data.data.image,
        keywords: data.data.keywords,
        canonical_url: data.data.canonical_url,
        postIdOrSlug,
      };

      initialValues = { ...updatedValues }; // Update initial values after successful save

      set({
        ...updatedValues,
        isSaving: false,
        error: null,
        hasChanges: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isSaving: false,
      });
    }
  }, 1000);

  return {
    title: "",
    post_id: null,
    description: "",
    image: "",
    keywords: [],
    canonical_url: "",
    isSaving: false,
    postIdOrSlug: null,
    error: null,
    isLoading: false,
    hasChanges: false,

    setKeyValue: (key, value) => {
      set({ [key]: value, hasChanges: true });
    },

    setSeoMetaOpts: (key, value) => {
      set({ [key]: value });
    },

    saveSeoMeta: debouncedSave,

    setPostIdOrSlug: (postIdOrSlug: string) => {
      set({ postIdOrSlug });
    },

    fetchSeoMeta: async () => {
      set({ isLoading: true });
      try {
        const { postIdOrSlug } = get();
        const response = await fetch(`/api/posts/${postIdOrSlug}/seometa`);

        if (!response.ok) {
          throw new Error("Failed to fetch SEO meta");
        }

        const data = await response.json();
        const fetchedValues = {
          post_id: data.data.post_id,
          title: data.data.title,
          description: data.data.description,
          image: data.data.image,
          keywords: data.data.keywords,
          canonical_url: data.data.canonical_url,
          postIdOrSlug,
        };

        initialValues = { ...fetchedValues }; // Set initial values for future comparisons

        set({
          ...fetchedValues,
          error: null,
          hasChanges: false,
        });
      } catch (error: any) {
        set({ error: error.message });
      } finally {
        set({ isLoading: false });
      }
    },
  };
});
