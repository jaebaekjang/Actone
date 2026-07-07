"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@actone/shared/supabase/client";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import { MicrophoneIcon } from "@/components/landing/stage-decor";

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
      <MicrophoneIcon />
      {loading ? "카카오로 이동 중…" : label}
    </Button>
  );
}
