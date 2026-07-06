"use client";

import Link from "next/link";
import { useState } from "react";
import { KakaoLoginButton } from "@/components/kakao-login-button";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@actone/shared";

interface Room {
  name: string;
  slug: string;
  desc: string;
}

const ROOMS = {
  audition: {
    name: "오디션 정보 공유방",
    slug: "audition-info",
    desc: "단편, 독립영화, 연극, 웹드라마 지원 정보를 배우들이 직접 나누는 곳입니다.",
  },
  field: {
    name: "현장 후기방",
    slug: "field-reviews",
    desc: "오디션과 촬영장에서 겪은 진짜 경험이 다음 사람의 준비물이 되는 곳입니다.",
  },
  study: {
    name: "스터디",
    slug: "study",
    desc: "대본 리딩, 독백, 카메라 연기를 함께 연습할 사람을 찾는 곳입니다.",
  },
  survival: {
    name: "배우 생존방",
    slug: "actor-survival",
    desc: "불안, 생계, 슬럼프까지 혼자 삼키지 않아도 되는 곳입니다.",
  },
  meetup: {
    name: "오프라인 모임",
    slug: "offline-meetups",
    desc: "같은 길을 걷는 배우들을 직접 만나 연결되는 곳입니다.",
  },
} satisfies Record<string, Room>;

const CONCERNS: { label: string; rooms: Room[] }[] = [
  { label: "오디션 정보가 필요해요", rooms: [ROOMS.audition] },
  { label: "촬영장 분위기가 무서워요", rooms: [ROOMS.field] },
  { label: "같이 연습할 사람이 없어요", rooms: [ROOMS.study] },
  { label: "배우를 계속해도 될지 모르겠어요", rooms: [ROOMS.survival] },
  { label: "쉬었다가 다시 시작하려고 해요", rooms: [ROOMS.survival, ROOMS.meetup] },
];

export function FindMyRoom() {
  const [selected, setSelected] = useState<number | null>(null);
  const picked = selected === null ? null : CONCERNS[selected];

  return (
    <section className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
        <p className="t-label">Act 02 · Find Your Room</p>
        <h2 className="t-display mt-3 text-xl text-foreground md:text-2xl">
          지금 내 상황에 맞는 방 찾기
        </h2>
        <p className="mt-2 text-sm text-muted">
          지금 가장 가까운 고민을 고르면 먼저 둘러볼 방을 추천해드릴게요.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {CONCERNS.map((concern, index) => (
            <button
              key={concern.label}
              type="button"
              onClick={() => setSelected(index)}
              aria-pressed={selected === index}
              className={cn(
                "rounded-full border px-4 py-2.5 text-sm transition-colors",
                selected === index
                  ? "border-accent bg-accent/15 font-medium text-accent-soft"
                  : "bg-surface text-muted hover:border-accent/40 hover:text-foreground",
              )}
            >
              {concern.label}
            </button>
          ))}
        </div>

        {picked ? (
          <div className="paper-card mt-6 rounded-xl p-5 md:p-6">
            <p className="t-label-dim">Recommended Room</p>
            <p className="mt-2 text-sm text-muted">당신에게 먼저 추천하는 방</p>
            <div className="mt-3 space-y-4">
              {picked.rooms.map((room) => (
                <div key={room.slug}>
                  <p className="text-lg font-bold text-foreground">{room.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{room.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={`/community/${picked.rooms[0].slug}`}
                className={buttonStyles("secondary", "md", "w-full sm:w-auto")}
              >
                이 방 먼저 둘러보기
              </Link>
              <KakaoLoginButton
                label="카카오로 입장하기"
                className="h-10 w-full px-4 text-sm sm:w-auto"
              />
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed px-5 py-6 text-sm text-dim">
            위에서 고민 하나를 고르면, 지금 나에게 맞는 방을 알려드립니다.
          </p>
        )}
      </div>
    </section>
  );
}
