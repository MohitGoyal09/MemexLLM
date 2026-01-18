import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/home";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or home page
      redirect(next);
    } else {
      // redirect the user to an error page with instructions
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // redirect the user to an error page with instructions
  redirect(`/auth/login?error=${encodeURIComponent("Invalid confirmation link")}`);
}
