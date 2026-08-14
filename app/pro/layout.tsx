import { ProBottomNav } from "@/components/shared/pro-bottom-nav";

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-24">
      {children}
      <ProBottomNav />
    </div>
  );
}
