import { createClient } from "@/lib/supabase/server";
import { authLogger } from "@/lib/auth-logger";
import { NextResponse } from "next/server";
import { validateRedirectPath } from "@/lib/validate-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = validateRedirectPath(searchParams.get("next"));
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Log that we received the OAuth callback
  authLogger.logOAuthCallbackReceived();

  // Handle OAuth error from provider
  if (errorParam) {
    authLogger.logOAuthFailed(undefined, errorDescription ?? errorParam);
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(errorDescription ?? errorParam)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Log successful OAuth completion
      authLogger.logOAuthCompleted(data.user.id, data.user.app_metadata?.provider);

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // In development, redirect to origin
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // In production with proxy
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Log OAuth failure during code exchange
    authLogger.logOAuthFailed(undefined, error?.message ?? "Code exchange failed");
  } else {
    // No code provided
    authLogger.logOAuthFailed(undefined, "No authorization code received");
  }

  // Return to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`);
}
