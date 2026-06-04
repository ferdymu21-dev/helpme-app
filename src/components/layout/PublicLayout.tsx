export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="
        min-h-screen
        bg-slate-50
      "
    >
      <div
        className="
          mx-auto
          flex
          min-h-screen
          max-w-md
          items-center
          justify-center
          p-6
        "
      >
        {children}
      </div>
    </main>
  );
}