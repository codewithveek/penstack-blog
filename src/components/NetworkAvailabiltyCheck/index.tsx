"use client";

import { HStack } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { LuWifi, LuWifiOff } from "react-icons/lu";

export default function NetworkAvailabiltyCheck({
  children,
}: {
  children?: ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => {
        setShowStatus(false);
      }, 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  const styles = isOnline
    ? {
        bg: "green.100",
        color: "green.500",
      }
    : { bg: "red.100", color: "red.500" };
  return (
    <>
      {showStatus && (
        <HStack justify={"center"} p={4} fontWeight={500} {...styles}>
          {isOnline ? (
            <HStack>
              <LuWifi />
              <p>You are back online</p>
            </HStack>
          ) : (
            <HStack>
              <LuWifiOff />
              <p>You are offline</p>
            </HStack>
          )}
        </HStack>
      )}
      {children}
    </>
  );
}
