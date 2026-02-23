"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, ApiRequestError } from "@/lib/api-client";

type Status = "verifying" | "success" | "error";

export function MagicLinkVerify() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("Invalid or missing token.");
      return;
    }

    authApi
      .verifyMagicLink(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.replace("/"), 2000);
      })
      .catch((err: unknown) => {
        setStatus("error");
        if (err instanceof ApiRequestError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Verification failed. The link may have expired.");
        }
      });
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      {status === "verifying" && (
        <>
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Verifying your link…</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            You&apos;re in!
          </h2>
          <p className="mt-1 text-sm text-gray-500">Redirecting you now…</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Link invalid</h2>
          <p className="mt-2 text-sm text-gray-500">{errorMsg}</p>
          <a
            href="/"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Return to site
          </a>
        </>
      )}
    </div>
  );
}
