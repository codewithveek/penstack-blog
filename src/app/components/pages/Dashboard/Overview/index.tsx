"use client";
import { Box, Grid, Stack, useColorModeValue } from "@chakra-ui/react";
import {
  LuFileStack,
  LuMailPlus,
  LuMessageCircle,
  LuUsersRound,
} from "react-icons/lu";
import PostViewsChart from "./PostViewsChart";
import MostPopularPosts from "./MostPopularPostArea";
import DashHeader from "@/components/Dashboard/Header";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { OverviewCard } from "./OverviewCard";

export default function Overview() {
  const bgColor = useColorModeValue("white", "gray.700");

  const { data: usersOverview, isLoading: isUsersLoading } = useQuery({
    staleTime: 1000 * 60 * 60 * 24,
    queryKey: ["overview_users"],
    queryFn: async () => {
      const { data } = await axios<{
        total: number;
        weeklyGrowth: number;
        isUp: boolean;
      }>("/api/analytics/overview/users");
      return data;
    },
  });
  const { data: postsOverview, isLoading: isPostsLoading } = useQuery({
    staleTime: 1000 * 60 * 60 * 24,
    queryKey: ["overview_posts_views"],
    queryFn: async () => {
      const { data } = await axios<{
        total: number;
        weeklyGrowth: number;
        isUp: boolean;
      }>("/api/analytics/overview/posts");
      return data;
    },
  });
  const { data: commentsOverview, isLoading: isCommentLoading } = useQuery({
    staleTime: 1000 * 60 * 60 * 24,
    queryKey: ["overview_comments"],
    queryFn: async () => {
      const { data } = await axios<{
        total: number;
        weeklyGrowth: number;
        isUp: boolean;
      }>("/api/analytics/overview/comments");
      return data;
    },
  });
  const { data: subscribersOverview, isLoading: isSubscriberLoading } =
    useQuery({
      staleTime: 1000 * 60 * 60 * 24,
      queryKey: ["overview_subscribers"],
      queryFn: async () => {
        const { data } = await axios<{
          total: number;
          weeklyGrowth: number;
          isUp: boolean;
        }>("/api/analytics/overview/subscribers");
        return data;
      },
    });
  return (
    <Box>
      <DashHeader></DashHeader>
      <Stack gap={4} p={4}>
        <Grid
          gap={4}
          templateColumns={{
            md: "repeat(2,1fr)",
            base: "1fr",
          }}
        >
          <OverviewCard
            isLoading={isUsersLoading}
            color="purple"
            link="/dashboard/users"
            label="Users"
            icon={LuUsersRound}
            value={usersOverview?.total || 0}
            isUp={usersOverview?.isUp}
            growthCount={usersOverview?.weeklyGrowth || 0}
          />
          <OverviewCard
            color="orange"
            label="Subscribers"
            link="/dashboard/newsletter"
            isLoading={isSubscriberLoading}
            icon={LuMailPlus}
            value={subscribersOverview?.total || 0}
            isUp={subscribersOverview?.isUp}
            growthCount={subscribersOverview?.weeklyGrowth}
          />
          <OverviewCard
            color="brand"
            isLoading={isPostsLoading}
            label="Posts"
            link="/dashboard/posts"
            icon={LuFileStack}
            value={postsOverview?.total || 0}
            isUp={postsOverview?.isUp}
            growthCount={postsOverview?.weeklyGrowth}
          />
          <OverviewCard
            color="green"
            isLoading={isCommentLoading}
            link="/dashboard/comments"
            label="Comments"
            icon={LuMessageCircle}
            value={commentsOverview?.total || 0}
            isUp={commentsOverview?.isUp}
            growthCount={commentsOverview?.weeklyGrowth}
          />
        </Grid>
        <Box>
          <PostViewsChart />
        </Box>
        <Box>
          <MostPopularPosts />
        </Box>
      </Stack>
    </Box>
  );
}
