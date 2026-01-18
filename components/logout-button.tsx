"use client";

import { createClient } from "@/lib/supabase/client";
import { authLogger } from "@/lib/auth-logger";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {}

export function LogoutButton(props: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();

    // Get current user ID before logout
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    authLogger.logLogout(userId);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      authLogger.logLogoutSuccess(userId);
      router.push("/auth/login");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      authLogger.logLogoutFailure(userId, errorMessage);
      // Still redirect to login even on error
      router.push("/auth/login");
    }
  };

  return <Button onClick={logout} {...props}>Logout</Button>;
}
