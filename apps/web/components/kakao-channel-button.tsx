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
      className="fixed bottom-20 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-kakao text-black shadow-lg transition-transform hover:scale-105 motion-reduce:hover:scale-100 md:bottom-6 md:right-6 md:h-auto md:w-auto md:gap-2 md:px-4 md:py-3 md:text-sm md:font-bold"
      aria-label="카카오채널 문의"
      title="카카오채널 문의"
    >
      <MessageCircle className="h-5 w-5 md:h-4 md:w-4" aria-hidden />
      <span className="hidden md:inline">카카오채널 문의</span>
    </button>
  );
}
