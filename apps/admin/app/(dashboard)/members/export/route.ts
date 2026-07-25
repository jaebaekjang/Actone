import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_LEVEL_LABELS, type Profile } from "@actone/shared";
import { requirePermission } from "@/lib/admin";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const { supabase } = await requirePermission("members.export");
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const level = sp.get("level")?.trim();
  const status = sp.get("status")?.trim();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (q) {
    const term = q.replaceAll(",", " ").replaceAll("%", "");
    query = query.or(`nickname.ilike.%${term}%,email.ilike.%${term}%`);
  }
  if (level) query = query.eq("member_level", level);
  if (status === "suspended") query = query.eq("is_suspended", true);
  if (status === "active") query = query.eq("is_suspended", false);

  const { data } = await query;
  const rows = (data as Profile[] | null) ?? [];

  const header = [
    "id",
    "닉네임",
    "이메일",
    "등급",
    "계정상태",
    "누적경고",
    "배우상태",
    "활동지역",
    "가입일",
    "UTM Source",
    "UTM Campaign",
  ];
  const lines = [header.join(",")];
  for (const m of rows) {
    lines.push(
      [
        m.id,
        m.nickname,
        m.email,
        MEMBER_LEVEL_LABELS[m.member_level] ?? m.member_level,
        m.is_suspended ? "정지" : "정상",
        m.warning_count,
        m.actor_status,
        m.region,
        m.created_at,
        m.utm_source,
        m.utm_campaign,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  // BOM so Excel reads UTF-8 Korean correctly
  const body = "﻿" + lines.join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="actone-members-${stamp}.csv"`,
    },
  });
}
