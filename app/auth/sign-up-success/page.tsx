"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function SignUpSuccessContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const handleResend = async () => {
    const emailToResend = email || prompt("Please enter your email to resend the link:");

    if (!emailToResend) return;

    setIsLoading(true);
    setMessage(null);
    setError(null);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToResend,
      });

      if (error) throw error;
      setMessage("Verification email resent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Check your email
              </CardTitle>
              <CardDescription>
                We've sent a confirmation link to your inbox.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-400">
                Click the link in the email to verify your account. If you don't see it, check your spam folder.
              </p>

              {message && (
                <p className="text-sm text-green-500 bg-green-500/10 p-2 rounded">
                  {message}
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
                  {error}
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend Verification Email"}
              </Button>

              <div className="pt-2 text-center">
                 <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                 </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SignUpSuccessContent />
    </Suspense>
  );
}
