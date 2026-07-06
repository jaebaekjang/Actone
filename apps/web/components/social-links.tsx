"use client";

import { siteConfig, type SocialLinkKey } from "@actone/shared";
import { toast } from "./ui/toast";

const LABELS: Record<SocialLinkKey, string> = {
  instagram: "인스타그램",
  kakaoChannel: "카카오채널",
  threads: "스레드",
  tiktok: "틱톡",
  youtube: "유튜브",
};

export function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm md:justify-end">
      {(Object.keys(LABELS) as SocialLinkKey[]).map((key) => {
        const url = siteConfig.socialLinks[key];
        const handle = siteConfig.socialHandles[key];
        const label = handle ? (
          <>
            {LABELS[key]}
            <span className="ml-1 font-mono text-xs text-dim">{handle}</span>
          </>
        ) : (
          LABELS[key]
        );
        if (!url) {
          return (
            <button
              key={key}
              type="button"
              onClick={() => toast("준비 중입니다")}
              className="text-muted/60 hover:text-muted"
            >
              {label}
            </button>
          );
        }
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted hover:text-foreground"
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
