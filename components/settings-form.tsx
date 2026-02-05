"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

import { useSearchParams } from "next/navigation";
import { GoogleDriveStatus } from "@/components/google-drive/GoogleDriveConnectionStatus";
import { handleGoogleDriveCallback } from "@/lib/api/gdrive";
import { toast } from "sonner";

export function SettingsForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
    };
    fetchUser();
  }, [router]);

  const [connectParams, setConnectParams] = useState<{ code: string; state?: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const processedRef = useRef(false);

  // Auto-process OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    
    // Safety check: if we already processed this or no code, skip
    if (!code || processedRef.current) {
        if (errorParam && !processedRef.current) {
             processedRef.current = true;
             toast.error(`Google Drive connection failed: ${errorParam}`);
             router.replace("/settings");
        }
        return;
    }

    const processCallback = async () => {
        processedRef.current = true;
        setIsProcessingCallback(true);
        const loadingToast = toast.loading("Finalizing connection...");
        
        try {
            // Clean URL immediately (visually) but keep params in memory
            // router.replace("/settings"); // Might cause unmount? better wait

            const result = await handleGoogleDriveCallback(code, state || undefined);
            toast.dismiss(loadingToast);

            if (result.success) {
                toast.success("Successfully connected to Google Drive");
                
                // Redirect back to source if provided in state
                if (state && state.startsWith("/")) {
                    // router.push is better than windown.location for SPA nav
                    router.push(state);
                } else {
                    router.replace("/settings");
                    setSuccess(result.message);
                    setRefreshKey((prev) => prev + 1);
                    setConnectParams(null); // Clear UI
                }
            } else {
                toast.error(result.message || "Failed to connect");
                setError(result.message);
                router.replace("/settings"); // Clear params on error
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            const msg = err instanceof Error ? err.message : "Connection failed";
            console.error("Callback error:", err);
            toast.error(msg);
            setError(msg);
            router.replace("/settings");
        } finally {
            setIsProcessingCallback(false);
        }
    };

    processCallback();
  }, [searchParams, router]);

  // Manual handler removed as we auto-process
  // const handleCompleteConnection = ... 

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;
      setSuccess("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-2xl mx-auto", className)} {...props}>
      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-display font-bold">Settings</h1>
         <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

     {isProcessingCallback && (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                </CardTitle>
                <CardDescription>
                    Finalizing your connection with Google Drive...
                </CardDescription>
            </CardHeader>
        </Card>
     )}

     <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Manage external service connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Google Drive</Label>
              <GoogleDriveStatus key={refreshKey} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
            
            {success && (
              <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                {success}
              </p>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View your verified account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid gap-1">
                  <Label>Email Address</Label>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded border">{user?.email}</p>
              </div>
            
          </CardContent>
      </Card>
    </div>
  );
}
