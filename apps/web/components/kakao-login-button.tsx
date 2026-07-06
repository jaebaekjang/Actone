"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@actone/shared/supabase/client";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";

export function KakaoLoginButton({
  label = "카카오로 시작하기",
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
    if (error) {
      toast("카카오 로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <Button
      variant="kakao"
      size="lg"
      onClick={handleLogin}
      disabled={loading}
      className={className}
    >
      {/* ticket stub: icon sits before a perforated edge (inherits text color) */}
      <span
        className="inline-flex items-center border-r border-dashed border-current/30 pr-2.5"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M12 3C6.48 3 2 6.52 2 10.86c0 2.78 1.85 5.22 4.63 6.6l-1.18 4.35c-.1.39.34.7.68.47l5.16-3.42c.23.02.47.03.71.03 5.52 0 10-3.52 10-7.86S17.52 3 12 3z" />
        </svg>
      </span>
      {loading ? "카카오로 이동 중…" : label}
    </Button>
  );
}
