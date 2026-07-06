import { LogOut } from "lucide-react";
import { AdminNav } from "@/components/nav";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // hard gate: session + profiles.role='admin' + admin_users.is_active
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-surface px-4">
        <p className="font-bold text-foreground">
          액트원 <span className="text-sm font-medium text-accent">관리자</span>
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{profile.nickname ?? profile.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border bg-surface-soft px-3 py-1.5 text-xs text-foreground hover:bg-surface-soft/70"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminNav />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
