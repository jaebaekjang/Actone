import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** meetup_date 등 DATE 컬럼 표시용 — 드라이버가 timestamp로 돌려줘도 YYYY-MM-DD만 남긴다 */
export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function timeAgo(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(d);
}

export function makeExcerpt(content: string, length = 120): string {
  const plain = content.replace(/\s+/g, " ").trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

/** "a, b, c" → ["a","b","c"] (max 5, deduped) */
export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
    ),
  ).slice(0, 5);
}
