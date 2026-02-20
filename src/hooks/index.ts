"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { PostInsert, PostSelect, UserSelect } from "@/types";
import TurndownService from "turndown";
import { useQuery } from "@tanstack/react-query";
import { objectToQueryParams } from "../utils";
import axios from "axios";

export function useHTMLToMarkdownConverter() {
  const [html, setHtml] = useState("");
  const [markdown, setMarkdown] = useState("");
  const turndownService = useMemo(() => new TurndownService(), []);

  // Add rules to handle specific HTML elements or attributes
  useEffect(() => {
    turndownService.addRule("heading", {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      replacement: function (content, node, options) {
        const hLevel = +node.nodeName.charAt(1);
        const hPrefix = "#".repeat(hLevel);
        return `\n${hPrefix} ${content}\n`;
      },
    });

    turndownService.addRule("paragraph", {
      filter: "p",
      replacement: function (content) {
        return `\n${content}\n`;
      },
    });
  }, [turndownService]);

  useEffect(() => {
    if (html) {
      setMarkdown(turndownService.turndown(html));
    }
  }, [html, turndownService]);

  const updateHtml = useCallback(
    (newHtml: string) => {
      setHtml(newHtml);
      return turndownService.turndown(newHtml);
    },
    [turndownService]
  );

  return { markdown, updateHtml };
}

interface UsePostsProps {
  status?: PostInsert["status"] | "all";
  limit?: number;
  page?: number;
  access?: "dashboard";
  sortBy?: "created_at" | "published_at" | "recent" | "popular";
  sortOrder?: "desc" | "asc";
  category?: string;
  canFetch?: boolean;
  initialData?: PostSelect[];
}
export function usePosts({
  status = "published",
  limit = 10,
  page = 1,
  sortBy,
  access,
  sortOrder,
  initialData,
  category,
  canFetch = true,
}: UsePostsProps = {}) {
  const [params, setParams] = useState({
    status,
    limit,
    page,
    sortBy,
    access,
    sortOrder,
    category,
    canFetch,
  });
  const {
    data: posts,
    loading,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", params],
    initialData,
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect[] }>(
        `/api/posts?${objectToQueryParams(params)}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
    enabled: canFetch,
  });

  const updateParams = useCallback((prop: UsePostsProps) => {
    setParams((prev) => ({ ...prev, ...prop }));
  }, []);
  const refetchPosts = useCallback(
    async (params?: UsePostsProps) => {
      params && updateParams(params);
      await refetch();
    },
    [refetch, updateParams]
  );
  return {
    posts,
    loading: loading || isFetching,
    error,
    refetchPosts,
    updateParams,
  };
}
export function useAuthor(username: string) {
  const {
    data: author,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["AUTHOR", username],
    queryFn: async () => {
      const { data } = await axios.get<{ data: UserSelect }>(
        `/api/authors/${username}`
      );
      return data.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 30,
  });

  return { author, loading, isError, error, refetch };
}
export function useAuthorPosts({
  status = "published",
  username,
  limit = 10,
  page = 1,
}: {
  status?: PostInsert["status"] | "all";
  limit?: number;
  page?: number;
  username: string;
}) {
  const {
    data: posts,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["POSTS", status, limit, page, username],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect[] }>(
        `/api/authors/${username}/posts?${objectToQueryParams({
          status,
          limit,
          page,
        })}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const refetchPosts = async () => {
    await refetch();
  };

  return { posts, loading, error, refetchPosts };
}

export function usePost(slug: string) {
  const {
    data: post,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["POST", slug],
    queryFn: async () => {
      const { data } = await axios.get<{ data: PostSelect }>(
        `/api/posts/${slug}`
      );
      return data.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const refetchPost = async () => {
    await refetch();
  };

  return { post, loading, error, refetchPost };
}

type QueryParamValue = string | number | boolean | null;

interface QueryParams {
  [key: string]: QueryParamValue;
}
