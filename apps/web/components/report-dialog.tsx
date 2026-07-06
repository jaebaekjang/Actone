"use client";

import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";
import { REPORT_REASONS } from "@actone/shared";
import { createReport } from "@/lib/actions/engagement";
import { Button } from "./ui/button";
import { Textarea } from "./ui/input";
import { toast } from "./ui/toast";

export function ReportDialog({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(undefined);
    startTransition(async () => {
      const result = await createReport({
        target_type: targetType,
        target_id: targetId,
        reason,
        detail,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      toast(result.message ?? "신고가 접수되었습니다.");
      setOpen(false);
      setReason("");
      setDetail("");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-400"
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        신고
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="신고하기"
        >
          <div className="w-full max-w-md rounded-xl border bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                {targetType === "post" ? "게시글 신고" : "댓글 신고"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted hover:text-foreground"
                aria-label="닫기"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground has-[:checked]:border-accent/60 has-[:checked]:bg-accent/10"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-[#f97316]"
                  />
                  {r}
                </label>
              ))}
            </div>

            <Textarea
              className="mt-3"
              placeholder="상세 내용 (선택, 500자 이하)"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              maxLength={500}
            />

            {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={submit}
                disabled={pending || !reason}
              >
                {pending ? "접수 중…" : "신고하기"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
