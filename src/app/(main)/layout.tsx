export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="pt-8 md:pl-16 bg-[#111111]">
      <div>{children}</div>
    </main>
  );
}
