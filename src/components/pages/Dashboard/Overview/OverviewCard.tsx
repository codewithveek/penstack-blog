import { Link } from "@chakra-ui/next-js";
import {
  Card as ChakraCard,
  Flex,
  GridItem,
  HStack,
  Heading,
  Image,
  Text,
  VStack,
  Grid,
  CardBody,
  useColorModeValue,
  Icon,
  Card,
  Skeleton,
  Button,
} from "@chakra-ui/react";
import { IconType } from "react-icons";
import { LuTrendingDown, LuTrendingUp } from "react-icons/lu";

export const OverviewCard = ({
  color,
  label,
  icon,
  value,
  isUp,
  growthCount,
  isLoading,
  link,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon: IconType;
  isUp?: boolean;
  growthCount?: number;
  isLoading?: boolean;
  link?: string;
}) => {
  const textColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  return (
    <GridItem w={"100%"}>
      <Card variant={"outline"}>
        <CardBody>
          <VStack
            m={0}
            align={"stretch"}
            gap={"10px"}
            rounded={"14px"}
            flex={1}
            w={"100%"}
          >
            <HStack justify={"space-between"} w={"full"}>
              <Flex
                justify={"center"}
                align={"center"}
                h={10}
                w={10}
                rounded={"full"}
                border={"1px"}
                borderColor={borderColor}
              >
                <Icon as={icon} size={20} color={color + ".500"} />
              </Flex>
              {isLoading ? (
                <Skeleton height={"30px"} width={"60px"} rounded="full" />
              ) : isUp ? (
                <ChartHighIcon />
              ) : (
                <ChartLowIcon />
              )}
            </HStack>

            <VStack align={"start"} gap={"5px"}>
              <Heading
                color={textColor}
                fontSize={"18px"}
                lineHeight={"26px"}
                fontWeight={"medium"}
              >
                {label}
              </Heading>
              <Text
                as={"span"}
                fontSize={"24px"}
                lineHeight={"32px"}
                fontWeight={"semibold"}
                color={"secondary"}
              >
                {isLoading ? (
                  <Skeleton height={"20px"} width={"100px"} rounded="full" />
                ) : (
                  value
                )}
              </Text>
            </VStack>
            <HStack wrap={"wrap"} justify={"space-between"}>
              <HStack gap={"10px"}>
                {isLoading ? (
                  <Skeleton height={"20px"} width={"60px"} rounded="full" />
                ) : (
                  <HStack
                    bg={isUp ? "green.100" : "red.100"}
                    px={2.5}
                    py={1}
                    gap={1}
                    rounded={"full"}
                    display={"inline-flex"}
                    h={6}
                  >
                    {isUp ? (
                      <LuTrendingUp color={"green"} />
                    ) : (
                      <LuTrendingDown color={"red"} />
                    )}
                    <Text
                      as={"span"}
                      fontWeight={"medium"}
                      lineHeight={"16px"}
                      fontSize={"12px"}
                      color={isUp ? "green" : "red"}
                    >
                      {isUp ? "+" + growthCount : growthCount}%
                    </Text>
                  </HStack>
                )}
                <Text as={"span"} fontSize={"14px"} color={textColor}>
                  vs. previous week
                </Text>
              </HStack>
              <Button as={Link} href={link} size={"sm"} variant={"ghost"}>
                See all
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </GridItem>
  );
};
const ChartHighIcon = () => (
  <svg
    width="106"
    height="33"
    viewBox="0 0 106 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M102.994 8.46666H105V33L1 33V11.4536L4.00877 18.9203L5.20413 21.9069H6.60551L9.40827 18.9203L11.3702 21.907L17.256 21.9072L20.339 18.9204L22.0207 14.4396L24.4683 16.6803L26.6747 18.9203L27.3638 22.3333L28.7651 21.9069H30.4858L33.6952 11.4536L34.6981 14.4403L36.3028 11.4536L37.5063 16.6803L40.7156 7.72028L42.5209 11.4536H45.9308L49.5413 3.98696L51.7477 7.72028L54.6535 5.48L58.194 11.4533L60.4704 1L62.1179 11.4533L73.1072 15.9333L74.5113 12.9466H75.9153L79.1247 8.46666H82.334L83.5375 12.9466L88.3515 3.98666L90.3574 15.9333L91.3603 11.4533H93.5667L95.5726 1L97.5784 9.95999L98.5813 5.48H101.189L102.994 8.46666Z"
      fill="url(#paint0_linear_2132_4599)"
      fillOpacity="0.16"
    />
    <path
      d="M105 8.4667H102.994L101.189 5.48004H98.5813L97.5784 9.96003L95.5726 1.00004L93.5667 11.4534H91.3603L90.3574 15.9333L88.3515 3.9867L83.5375 12.9467L82.334 8.4667H79.1247L75.9153 12.9467H74.5113L73.1072 15.9333L62.1179 11.4534L60.4704 1.00004L58.194 11.4534L54.6535 5.48004L51.7477 7.72032L49.5413 3.987L45.9308 11.4536H42.5209L40.7156 7.72032L37.5063 16.6803L36.3028 11.4536L34.6981 14.4403L33.6952 11.4536L30.4858 21.907H28.7651L27.3638 22.3334L26.6747 18.9203L24.4683 16.6803L22.0206 14.4396L20.339 18.9204L17.256 21.9073L11.3702 21.907L9.40827 18.9203L6.60551 21.907H5.20414L4.00877 18.9203L1 11.4536"
      stroke="#66C87B"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_2132_4599"
        x1="53"
        y1="33"
        x2="53"
        y2="1"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#77B900" stopOpacity="0" />
        <stop offset="0.525" stopColor="#77B900" stopOpacity="0.648235" />
        <stop offset="0.809892" stopColor="#77B900" />
      </linearGradient>
    </defs>
  </svg>
);
const ChartLowIcon = () => (
  <svg
    width="106"
    height="33"
    viewBox="0 0 106 33"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.00584 8.46666H1L1 33L105 33V11.4536L101.991 18.9203L100.796 21.9069H99.3945L96.5917 18.9203L94.6298 21.907L88.744 21.9072L85.661 18.9204L83.9793 14.4396L81.5317 16.6803L79.3253 18.9203L78.6362 22.3333L77.2349 21.9069H75.5142L72.3048 11.4536L71.3019 14.4403L69.6972 11.4536L68.4937 16.6803L65.2844 7.72028L63.4791 11.4536H60.0692L56.4587 3.98696L54.2523 7.72028L51.3465 5.48L47.806 11.4533L45.5296 1L43.8821 11.4533L32.8928 15.9333L31.4887 12.9466H30.0847L26.8753 8.46666H23.666L22.4625 12.9466L17.6485 3.98666L15.6426 15.9333L14.6397 11.4533H12.4333L10.4274 1L8.4216 9.95999L7.41868 5.48H4.81109L3.00584 8.46666Z"
      fill="url(#paint0_linear_2133_4687)"
      fillOpacity="0.16"
    />
    <path
      d="M1 8.4667H3.00584L4.81109 5.48004H7.41868L8.4216 9.96003L10.4274 1.00004L12.4333 11.4534H14.6397L15.6426 15.9333L17.6485 3.9867L22.4625 12.9467L23.666 8.4667H26.8753L30.0847 12.9467H31.4887L32.8928 15.9333L43.8821 11.4534L45.5296 1.00004L47.806 11.4534L51.3465 5.48004L54.2523 7.72032L56.4587 3.987L60.0692 11.4536H63.4791L65.2844 7.72032L68.4937 16.6803L69.6972 11.4536L71.3019 14.4403L72.3048 11.4536L75.5142 21.907H77.2349L78.6362 22.3334L79.3253 18.9203L81.5317 16.6803L83.9794 14.4396L85.661 18.9204L88.744 21.9073L94.6298 21.907L96.5917 18.9203L99.3945 21.907H100.796L101.991 18.9203L105 11.4536"
      stroke="#ED544E"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_2133_4687"
        x1="53"
        y1="33"
        x2="53"
        y2="1"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED544E" stopOpacity="0" />
        <stop offset="0.809892" stopColor="#ED544E" />
      </linearGradient>
    </defs>
  </svg>
);
