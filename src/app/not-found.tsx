"use client";
import { NextPage } from "next";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const NotFound: NextPage = () => {
  const router = useRouter();

  return (
    <Container maxW="container.xl" h="100vh" centerContent>
      <VStack spacing={8} align="center" justify="center" h="full">
        <NotFoundSvg />
        <Heading as="h1" size="2xl" textAlign="center">
          Oops! Page Not Found
        </Heading>
        <Text fontSize="xl" textAlign="center" maxW="600px">
          We couldn&apos;t find the page you&apos;re looking for. It might have
          been removed, renamed, or doesn&apos;t exist.
        </Text>
        <Box>
          <Button as={Link} rounded={"full"} size="lg" href="/" mr={4}>
            Go Home
          </Button>
          <Button
            rounded={"full"}
            variant="outline"
            size="lg"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
const NotFoundSvg = () => {
  return (
    <svg
      viewBox="0 0 800 600"
      width={"100%"}
      height={400}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* <!-- Shadow filter --> */}
        <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="3"
            dy="6"
            stdDeviation="5"
            floodColor="#000000"
            floodOpacity="0.3"
          />
        </filter>
      </defs>

      {/* <!-- Background --> */}
      <rect width="800" height="600" fill="#f8f9fa" />

      {/* <!-- Floating geometric shapes --> */}
      <circle cx="100" cy="100" r="20" fill="#e9ecef" opacity="0.5">
        <animate
          attributeName="cy"
          values="100;80;100"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <polygon points="700,50 720,90 680,90" fill="#e9ecef" opacity="0.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 700 70;360 700 70"
          dur="8s"
          repeatCount="indefinite"
        />
      </polygon>
      <rect
        x="150"
        y="450"
        width="15"
        height="15"
        fill="#e9ecef"
        opacity="0.5"
        transform="rotate(45 157.5 457.5)"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.7;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      {/* <!-- Main 404 Text --> */}
      <text
        x="400"
        y="200"
        font-family="Arial, sans-serif"
        font-size="120"
        fontWeight="bold"
        textAnchor="middle"
        fill="#343a40"
        filter="url(#dropshadow)"
      >
        404
      </text>

      {/* <!-- Broken robot/character --> */}
      <g transform="translate(400, 280)">
        {/* <!-- Robot body --> */}
        <rect
          x="-60"
          y="0"
          width="120"
          height="80"
          rx="10"
          fill="#34495e"
          filter="url(#dropshadow)"
        />

        {/* <!-- Robot head --> */}
        <rect
          x="-40"
          y="-50"
          width="80"
          height="60"
          rx="8"
          fill="#2c3e50"
          filter="url(#dropshadow)"
        />

        {/* <!-- Eyes (X marks for broken) --> */}
        <g stroke="#e74c3c" strokeWidth="4" strokeLinecap="round">
          <line x1="-25" y1="-35" x2="-15" y2="-25" />
          <line x1="-15" y1="-35" x2="-25" y2="-25" />
          <line x1="15" y1="-35" x2="25" y2="-25" />
          <line x1="25" y1="-35" x2="15" y2="-25" />
        </g>

        {/* <!-- Mouth (sad) --> */}
        <path
          d="M -20 -10 Q 0 0 20 -10"
          stroke="#e74c3c"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* <!-- Arms --> */}
        <rect x="-90" y="10" width="25" height="40" rx="5" fill="#34495e" />
        <rect x="65" y="10" width="25" height="40" rx="5" fill="#34495e" />

        {/* <!-- Legs --> */}
        <rect x="-40" y="80" width="25" height="40" rx="5" fill="#34495e" />
        <rect x="15" y="80" width="25" height="40" rx="5" fill="#34495e" />

        {/* <!-- Sparks/error indicators --> */}
        <g fill="#ffc107">
          <polygon points="-70,5 -65,15 -75,15">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </polygon>
          <polygon points="75,20 80,30 70,30">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.7s"
              repeatCount="indefinite"
            />
          </polygon>
          <polygon points="-10,-60 -5,-50 -15,-50">
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </polygon>
        </g>
      </g>

      {/* <!-- Floating dots for ambiance --> */}
      <circle cx="200" cy="300" r="3" fill="#dee2e6">
        <animate
          attributeName="cy"
          values="300;280;300"
          dur="4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="600" cy="400" r="2" fill="#dee2e6">
        <animate
          attributeName="cy"
          values="400;420;400"
          dur="3.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="750" cy="200" r="4" fill="#dee2e6">
        <animate
          attributeName="cy"
          values="200;180;200"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};
export default NotFound;
