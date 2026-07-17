import { LogOut } from "lucide-react";
import { ADMIN_ROLE_LABELS } from "@actone/shared";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // hard gate: session + profiles.role='admin' + admin_users.is_active
  const { profile, roleKey, permissions } = await requireAdmin();

  const headerRight = (
    <>
      <div className="hidden text-right sm:block">
        <p className="text-xs font-medium text-foreground">
          {profile.nickname ?? profile.email}
        </p>
        <p className="text-[11px] text-accent-soft">
          {ADMIN_ROLE_LABELS[roleKey] ?? roleKey}
        </p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg border bg-surface-soft px-3 py-1.5 text-xs text-foreground hover:bg-surface-soft/70"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          로그아웃
        </button>
      </form>
    </>
  );

  return (
    <AdminShell permissions={[...permissions]} headerRight={headerRight}>
      {children}
    </AdminShell>
  );
}
