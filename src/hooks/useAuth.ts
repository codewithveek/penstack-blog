import { useSession } from "@/lib/auth/auth-client";
import { useMemo } from "react";

export const useAuth = () => {
  const { data: session, isPending } = useSession();

  const authState = useMemo(() => {
    const isAuthenticated = !!session?.user;
    const isLoading = isPending;

    return {
      user: session?.user,
      status: isAuthenticated
        ? "authenticated"
        : loading
          ? "loading"
          : "unauthenticated",
      isAuthenticated,
      loading,
    };
  }, [session, isPending]);

  return authState;
};
