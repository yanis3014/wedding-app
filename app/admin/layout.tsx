"use client";

import { LogOut, LayoutDashboard, Users, Briefcase, CreditCard, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/connexion";
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/prestataires", label: "Prestataires", icon: Briefcase },
    { href: "/admin/abonnements", label: "Abonnements", icon: CreditCard },
    { href: "/admin/carte", label: "Carte", icon: Map },
    { href: "/admin/clients", label: "Clients", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-porcelain">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-10 flex h-screen w-64 flex-col border-r border-black/10 bg-card">
        {/* Logo */}
        <div className="border-b border-black/10 p-6">
          <Link href="/admin/dashboard" className="font-heading text-xl font-medium tracking-tight text-ink">
            Mon Mariage
          </Link>
          <p className="mt-1 text-xs text-ink-muted">Administration</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-henna/10 text-henna"
                    : "text-ink-muted hover:bg-porcelain/60 hover:text-ink"
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-black/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-ink-muted hover:bg-porcelain/60 hover:text-ink"
          >
            <LogOut className="size-5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
