import AdminGuard from "@/features/admin/components/AdminGuard";
import AdsManagementPage from "@/features/ads/pages/AdsManagementPage";

export default function Page() {
  return (
    <AdminGuard>
      <AdsManagementPage />
    </AdminGuard>
  );
}