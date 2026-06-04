import PublicOnlyLayout from
"@/features/auth/layouts/PublicOnlyLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicOnlyLayout>
      {children}
    </PublicOnlyLayout>
  );
}