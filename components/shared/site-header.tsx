"use client";

import { User } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/lib/supabase/auth-client";

export function SiteHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <header className="border-b border-black/10 bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl font-medium tracking-tight text-ink">
          Mon Mariage
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              href="/profil"
              className="flex size-9 items-center justify-center rounded-full bg-henna/10 text-henna transition-colors hover:bg-henna/20"
            >
              <User className="size-5" />
            </Link>
          ) : (
            <Link
              href="/connexion"
              className="text-sm font-medium text-henna hover:underline"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
