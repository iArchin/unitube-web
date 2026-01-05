export default function ShortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[#000000]">
      <div className="h-screen overflow-hidden">{children}</div>
    </main>
  );
}

