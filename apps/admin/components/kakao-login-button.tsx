"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@actone/shared/supabase/client";

export function KakaoLoginButton({
  label = "카카오로 로그인",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-kakao px-6 text-base font-semibold text-black transition-all hover:brightness-95 disabled:opacity-60 ${className ?? ""}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black" aria-hidden>
        <path d="M12 3C6.48 3 2 6.52 2 10.86c0 2.78 1.85 5.22 4.63 6.6l-1.18 4.35c-.1.39.34.7.68.47l5.16-3.42c.23.02.47.03.71.03 5.52 0 10-3.52 10-7.86S17.52 3 12 3z" />
      </svg>
      {loading ? "카카오로 이동 중…" : label}
    </button>
  );
}
