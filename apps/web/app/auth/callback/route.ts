import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        let { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        // fallback if the auth.users trigger did not run
        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email ?? null,
            kakao_id: (user.user_metadata?.provider_id as string) ?? null,
            avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
          });
          profile = { onboarding_completed: false };
        }

        const dest = profile.onboarding_completed ? "/community" : "/onboarding";
        return NextResponse.redirect(`${origin}${dest}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
