import { DEFAULT_REGULAR_MEMBER_RULE, type RegularMemberRule } from "@actone/shared";
import { Card, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/admin";
import { RuleForm } from "./rule-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "regular_member_rule")
    .maybeSingle();

  const rule: RegularMemberRule = {
    ...DEFAULT_REGULAR_MEMBER_RULE,
    ...((data?.value as Partial<RegularMemberRule>) ?? {}),
  };

  return (
    <div className="max-w-xl space-y-5">
      <PageHeader
        title="회원 등급 설정"
        description="정회원 자동 승급 조건을 설정합니다. 기본값은 비활성화(OFF)입니다."
      />

      <Card>
        <RuleForm rule={rule} />
      </Card>

      <Card className="text-sm leading-relaxed text-muted">
        <p className="font-medium text-foreground">안내</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>자동 승급이 꺼져 있으면 조건을 충족해도 승급되지 않습니다.</li>
          <li>자동 승급은 신규회원 → 정회원만 처리합니다.</li>
          <li>튜터는 자동 승급 대상이 아니며, 회원 상세에서 수동으로만 지정할 수 있습니다.</li>
          <li>자동 승급 내역은 등급 변경 이력에 &lsquo;자동&rsquo;으로 기록됩니다.</li>
        </ul>
      </Card>
    </div>
  );
}
