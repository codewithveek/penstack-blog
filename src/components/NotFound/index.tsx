"use client";
import React, { useState, useEffect, memo } from "react";
import {
  LuWifiOff,
  LuRefreshCw,
  LuAlertTriangle,
  LuGlobe,
  LuClock,
} from "react-icons/lu";

interface NetworkError extends Error {
  code?: string;
}
export const NetworkErrorHandler = memo(
  ({
    error = null,
    onRetry = () => {},
    showRetryButton = true,
    customMessage = null,
    className = "",
  }: {
    error: NetworkError | null;
    onRetry?: () => void | Promise<void>;
    showRetryButton?: boolean;
    customMessage?: string | null;
    className?: string;
  }) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Monitor online/offline status
    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);

    const handleRetry = async () => {
      setIsRetrying(true);
      try {
        await onRetry();
      } catch (err) {
        console.error("Retry failed:", err);
      } finally {
        setIsRetrying(false);
      }
    };

    const getErrorDetails = (error: NetworkError) => {
      if (!error) {
        return {
          icon: LuWifiOff,
          title: "No Internet Connection",
          message: "Please check your internet connection and try again.",
          color: "text-red-500",
        };
      }

      const errorCode = error.code || error.message || "";
      const errorString = errorCode.toString().toLowerCase();

      if (
        errorString.includes("etimedout") ||
        errorString.includes("timeout")
      ) {
        return {
          icon: LuClock,
          title: "Connection Timeout",
          message:
            "The request took too long to complete. This might be due to a slow connection or server issues.",
          color: "text-orange-500",
        };
      }

      if (
        errorString.includes("econnrefused") ||
        errorString.includes("econnfailed") ||
        errorString.includes("connection")
      ) {
        return {
          icon: LuGlobe,
          title: "Connection Failed",
          message:
            "Unable to connect to the server. Please check your internet connection or try again later.",
          color: "text-red-500",
        };
      }

      if (errorString.includes("enotfound") || errorString.includes("dns")) {
        return {
          icon: LuAlertTriangle,
          title: "Server Not Found",
          message:
            "The server could not be reached. Please check the URL or try again later.",
          color: "text-yellow-500",
        };
      }

      if (errorString.includes("econnreset")) {
        return {
          icon: LuRefreshCw,
          title: "Connection Reset",
          message: "The connection was interrupted. Please try again.",
          color: "text-blue-500",
        };
      }

      // Generic network error
      return {
        icon: LuWifiOff,
        title: "Network Error",
        message:
          "A network error occurred. Please check your connection and try again.",
        color: "text-red-500",
      };
    };

    const errorDetails = getErrorDetails(error as NetworkError);
    const Icon = errorDetails.icon;

    return (
      <div
        className={`flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto ${className}`}
      >
        {/* Connection Status Indicator */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isOnline
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {/* Error Icon */}
        <div
          className={`mb-4 p-3 rounded-full bg-gray-100 ${errorDetails.color}`}
        >
          <Icon size={32} />
        </div>

        {/* Error Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {errorDetails.title}
        </h3>

        {/* Error Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {customMessage || errorDetails.message}
        </p>

        {/* Error Code (if available) */}
        {error && (error.code || error.message) && (
          <div className="mb-4 px-3 py-2 bg-gray-100 rounded text-sm text-gray-500 font-mono">
            {error.code || error.message}
          </div>
        )}

        {/* Retry Button */}
        {showRetryButton && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <LuRefreshCw
              size={16}
              className={`mr-2 ${isRetrying ? "animate-spin" : ""}`}
            />
            {isRetrying ? "Retrying..." : "Try Again"}
          </button>
        )}

        {/* Additional Help Text */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>If the problem persists:</p>
          <ul className="text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Refresh the page</li>
            <li>• Try again in a few minutes</li>
          </ul>
        </div>
      </div>
    );
  }
);
NetworkErrorHandler.displayName = "NetworkErrorHandler";
