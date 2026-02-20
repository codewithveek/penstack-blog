import {
  Card,
  Heading,
  HStack,
  Button,
  Box,
  Text,
  Menu,
  Icon,
  VStack,
} from "@chakra-ui/react";
import React, { memo, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useQuery } from "@tanstack/react-query";
import { AggregatedPostViews } from "@/types";
import { LuChevronDown } from "react-icons/lu";
import { useSiteConfig } from "@/context/SiteConfig";
import { useColorModeValue } from "@/components/ui/color-mode";

const PostViewsChart = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState({
    label: "7 days",
    value: "7",
  });
  const timeRanges = useMemo(
    () => [
      { label: "7 days", value: "7" },
      { label: "30 days", value: "30" },
      { label: "60 days", value: "60" },
      { label: "90 days", value: "90" },
      { label: "All time", value: "all" },
    ],
    []
  );

  const { data: postViews, isPending } = useQuery({
    queryKey: ["analyticsPostViews", selectedTimeRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/posts/views?timeRange=${selectedTimeRange.value}`
      );
      const data = await response.json();
      return data.data as AggregatedPostViews[];
    },
    refetchOnMount: false,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const tooltipContentBg = useColorModeValue("white", "gray.900");
  const tooltipTextColor = useColorModeValue("black", "white");
  const gridColor = useColorModeValue("#e0e0e0", "#444444");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          px={4}
          py={2}
          shadow={"md"}
          border={"1px solid"}
          borderColor={borderColor}
          bg={tooltipContentBg}
          color={tooltipTextColor}
          rounded={"lg"}
        >
          <Text fontWeight={500} mb={1}>
            {formatDate(label)}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Box key={index}>
              <HStack>
                <Box rounded={"full"} w={2} h={2} bg={entry.color}></Box>
                <Text
                  fontSize={"15px"}
                  color={"gray.500"}
                >{`${entry.value} views`}</Text>
              </HStack>
            </Box>
          ))}
        </Box>
      );
    }

    return null;
  };
  return (
    <Card.Root variant={"outline"}>
      <Card.Header>
        <HStack wrap={"wrap"} justify={"space-between"} gap={4}>
          <Heading size={"md"}>Post Views</Heading>
          <HStack wrap={"wrap"} gap={2}>
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button size={"sm"} variant={"outline"}>
                  {selectedTimeRange.label}
                  <LuChevronDown />
                </Button>
              </Menu.Trigger>
              <Menu.Content>
                {timeRanges.map((range) => (
                  <Menu.Item
                    key={range.value}
                    value={range.value}
                    rounded={"lg"}
                    onClick={() => setSelectedTimeRange(range)}
                  >
                    {range.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Root>
          </HStack>
        </HStack>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          {isPending ? (
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              height={"100%"}
            >
              <Text>Fetching data...</Text>
            </Box>
          ) : (
            <AreaChart
              width={undefined}
              height={400}
              data={postViews}
              margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="viewed_date"
                tickFormatter={formatDate}
                textAnchor="end"
                height={30}
                fontSize={14}
              />
              <YAxis fontSize={14} width={50} />
              <Tooltip
                content={<CustomTooltip />}
                labelFormatter={formatDate}
              />
              <Legend />
              <Area
                dot={{ r: 1 }}
                activeDot={{ r: 6 }}
                name="Total views"
                stackId={1}
                dataKey="total_views"
                stroke="var(--chakra-colors-green-500)"
                fill="var(--chakra-colors-green-400)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dot={{ r: 1 }}
                activeDot={{ r: 6 }}
                name="Unique views"
                stackId={1}
                type="monotone"
                dataKey="unique_views"
                stroke="var(--chakra-colors-blue-500)"
                fill="var(--chakra-colors-blue-400)"
                strokeWidth={2}
              />
              <Area
                stackId={1}
                dot={{ r: 1 }}
                activeDot={{ r: 6 }}
                type="monotone"
                name="Anonymous views"
                dataKey="anonymous_views"
                stroke="var(--chakra-colors-orange-500)"
                fill="var(--chakra-colors-orange-400)"
                strokeWidth={2}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Card.Body>
    </Card.Root>
  );
};
const PostViewChartWrapper = () => {
  const siteSettings = useSiteConfig();
  const [selectedTimeRange, setSelectedTimeRange] = useState({
    label: "7 days",
    value: "7",
  });
  const timeRanges = useMemo(
    () => [
      { label: "7 days", value: "7" },
      { label: "30 days", value: "30" },
      { label: "60 days", value: "60" },
      { label: "90 days", value: "90" },
      { label: "All time", value: "all" },
    ],
    []
  );
  return (
    <>
      {siteSettings.localPostAnalytics.enabled ? (
        <PostViewsChart />
      ) : (
        <Card.Root variant={"outline"}>
          <Card.Header>
            <HStack wrap={"wrap"} justify={"space-between"} gap={4}>
              <Heading size={"md"}>Post Views</Heading>
              <HStack wrap={"wrap"} gap={2}>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button disabled size={"sm"} variant={"outline"}>
                      {selectedTimeRange.label}
                      <LuChevronDown />
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content>
                    {timeRanges.map((range) => (
                      <Menu.Item
                        key={range.value}
                        value={range.value}
                        rounded={"lg"}
                        onClick={() => setSelectedTimeRange(range)}
                      >
                        {range.label}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Root>
              </HStack>
            </HStack>
          </Card.Header>
          <Card.Body h={350}>
            <VStack>
              <Heading size={"md"}> Post view not available</Heading>
              <Text color={"gray.500"} fontSize={"smaller"}>
                {" "}
                Post Analytics is disabled
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </>
  );
};
export default memo(PostViewChartWrapper);
