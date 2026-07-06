"use client";

import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@actone/shared";
import { toast } from "@/components/ui/toast";

const CHANNELS = [
  {
    key: "instagram" as const,
    name: "인스타그램",
    handle: "act_one_community",
    desc: "대기실 밖에서 만나는 액트원의 순간들",
  },
  {
    key: "threads" as const,
    name: "스레드",
    handle: "act_one_community",
    desc: "배우들의 짧은 생각과 하루",
  },
  {
    key: "youtube" as const,
    name: "유튜브",
    handle: "장재백_액트원 · @액트원",
    desc: "배우들을 위한 이야기와 콘텐츠",
  },
];

export function SocialChannels() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <p className="t-label">Outside the Theater</p>
        <h2 className="t-display mt-3 text-xl text-foreground md:text-2xl">
          액트원은 밖에서도 이어집니다
        </h2>
        <p className="mt-2 text-sm text-muted">
          커뮤니티 안의 이야기와 배우들을 위한 콘텐츠는 SNS에서도 이어집니다.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {CHANNELS.map((channel) => {
            const url = siteConfig.socialLinks[channel.key];
            const body = (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground">{channel.name}</span>
                  <ArrowUpRight
                    className="h-4 w-4 text-dim transition-colors group-hover:text-accent-soft"
                    aria-hidden
                  />
                </div>
                <p className="mt-0.5 font-mono text-xs text-accent-soft">{channel.handle}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{channel.desc}</p>
              </>
            );
            return url ? (
              <a
                key={channel.key}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="pinned-note group rounded-lg border bg-background p-5"
              >
                {body}
              </a>
            ) : (
              <button
                key={channel.key}
                type="button"
                onClick={() => toast("준비 중입니다")}
                className="pinned-note group rounded-lg border bg-background p-5 text-left"
              >
                {body}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
