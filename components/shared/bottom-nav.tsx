"use client";

import { Calendar, Home, MessageSquare, Star, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/supabase/auth-client";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", icon: <Home className="size-5" />, label: "Accueil" },
  { href: "/mes-demandes", icon: <MessageSquare className="size-5" />, label: "Demandes" },
  { href: "/agenda", icon: <Calendar className="size-5" />, label: "Agenda" },
  { href: "/avis", icon: <Star className="size-5" />, label: "Avis" },
  { href: "/profil", icon: <User className="size-5" />, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // Don't show nav while loading
  if (isLoading) {
    return null;
  }

  // Don't show nav if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't show nav on auth pages
  if (pathname === "/connexion" || pathname === "/inscription") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-card">
      <nav className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2 sm:px-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
              isActive(item.href)
                ? "text-henna"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
