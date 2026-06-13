import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the PKCE code-exchange used by Supabase password-reset and email
// confirmation links (e.g. /auth/callback?code=...&next=/reset-password).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
