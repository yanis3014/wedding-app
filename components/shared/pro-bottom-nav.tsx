"use client";

import { Calendar, LayoutDashboard, Star, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/supabase/auth-client";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/pro/dashboard", icon: <LayoutDashboard className="size-5" />, label: "Tableau" },
  { href: "/pro/profil", icon: <User className="size-5" />, label: "Profil" },
  { href: "/pro/avis", icon: <Star className="size-5" />, label: "Avis" },
];

export function ProBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const supabase = createClient();
  
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkValidation = async () => {
      if (!isAuthenticated) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      const { data: prestataireData } = await supabase
        .from("prestataires")
        .select("statut_validation")
        .eq("id", user.id)
        .single();

      setIsValid(prestataireData?.statut_validation === "valide");
      setIsValidating(false);
    };

    checkValidation();
  }, [isAuthenticated, supabase]);

  // Don't show nav while loading
  if (isLoading || isValidating) {
    return null;
  }

  // Don't show nav if not authenticated or not validated
  if (!isAuthenticated || !isValid) {
    return null;
  }

  // Don't show nav on auth pages
  if (pathname === "/connexion" || pathname === "/inscription") {
    return null;
  }

  const isActive = (href: string) => {
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
