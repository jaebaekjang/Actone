"use client";

import { AtSign, Instagram, Youtube, type LucideIcon } from "lucide-react";
import { siteConfig } from "@actone/shared";
import { toast } from "@/components/ui/toast";
import { SectionHeader } from "./section-header";

const CHANNELS: {
  key: "instagram" | "threads" | "youtube";
  name: string;
  handle: string;
  icon: LucideIcon;
}[] = [
  { key: "instagram", name: "인스타그램", handle: "act_one_community", icon: Instagram },
  { key: "threads", name: "스레드", handle: "act_one_community", icon: AtSign },
  { key: "youtube", name: "유튜브", handle: "장재백_액트원 · @액트원", icon: Youtube },
];

export function SocialChannels() {
  return (
    <section className="border-b bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <SectionHeader
          eyebrow="SNS 채널"
          strong="액트원은 밖에서도 이어집니다"
          sub="커뮤니티 안의 이야기와 배우들을 위한 콘텐츠는 SNS에서도 이어집니다."
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {CHANNELS.map((channel) => {
            const url = siteConfig.socialLinks[channel.key];
            const Icon = channel.icon;
            const body = (
              <>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-festival text-white transition-transform group-hover:scale-105 motion-reduce:group-hover:scale-100">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-left">
                  <span className="block font-bold text-foreground">{channel.name}</span>
                  <span className="block text-xs text-muted">{channel.handle}</span>
                </span>
              </>
            );
            const cls =
              "group inline-flex items-center gap-3.5 rounded-full border bg-background py-2.5 pl-2.5 pr-6 transition-colors hover:border-festival/50";
            return url ? (
              <a
                key={channel.key}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className={cls}
              >
                {body}
              </a>
            ) : (
              <button
                key={channel.key}
                type="button"
                onClick={() => toast("준비 중입니다")}
                className={cls}
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
