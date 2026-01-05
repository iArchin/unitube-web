export default function ShortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-background min-h-screen">
      <div className="min-h-screen">{children}</div>
    </main>
  );
}

