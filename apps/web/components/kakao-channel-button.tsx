"use client";

import { MessageCircle } from "lucide-react";
import { siteConfig } from "@actone/shared";
import { toast } from "./ui/toast";

export function KakaoChannelButton() {
  const url = siteConfig.socialLinks.kakaoChannel;

  const handleClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast("준비 중입니다");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-20 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-kakao px-4 py-3 text-sm font-semibold text-black shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      aria-label="카카오채널 문의"
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      카카오채널 문의
    </button>
  );
}
