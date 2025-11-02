"use client";
import { useEffect } from "react";
import { initMixpanel } from "@/lib/mixpanel";

export default function MixpanelAnalytics({ token }: { token: string }) {
  useEffect(() => {
    initMixpanel({ token });
  }, [token]);

  return <></>;
}
