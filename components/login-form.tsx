"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { authLogger } from "@/lib/auth-logger";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    authLogger.logLoginAttempt(email);

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;
      authLogger.logLoginSuccess(data.user?.id ?? "unknown", normalizedEmail);
      router.push("/home");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      authLogger.logLoginFailure(email, errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);

    const redirectUrl = `${window.location.origin}/auth/callback`;
    authLogger.logOAuthStarted("google", redirectUrl);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      // OAuth redirect will happen, so success logging is in callback
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      authLogger.logOAuthFailed("google", errorMessage);
      setError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md" role="alert" aria-live="polite">{error}</p>}
              <Button type="submit" className="w-full h-11 hover:shadow-primary transition-all" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                aria-busy={isGoogleLoading}
              >
                <FcGoogle className="w-5 h-5" aria-hidden="true" />
                {isGoogleLoading ? "Redirecting..." : "Sign in with Google"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
