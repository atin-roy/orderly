import { AuthGuard } from "@/components/auth-guard";
import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
