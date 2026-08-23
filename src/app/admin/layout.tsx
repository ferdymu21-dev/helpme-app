import AdminGuard from "@/features/admin/components/AdminGuard";

import AdminLayout from "@/features/admin/components/layout/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}