"use client";

import { Camera, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProfilFormProps = {
  initialData: any;
  email: string;
};

export default function ProfilForm({ initialData, email }: ProfilFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    firstName: initialData.prenom || "",
    lastName: initialData.nom || "",
    partnerFirstName: initialData.partenaire_prenom || "",
    partnerLastName: initialData.partenaire_nom || "",
    phone: initialData.telephone || "",
    weddingDate: initialData.date_mariage || "",
    weddingLocation: initialData.lieu_souhaite || "",
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user found");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({
        prenom: formData.firstName,
        nom: formData.lastName,
        partenaire_prenom: formData.partnerFirstName || null,
        partenaire_nom: formData.partnerLastName || null,
        telephone: formData.phone || null,
        date_mariage: formData.weddingDate || null,
        lieu_souhaite: formData.weddingLocation || null,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving profile:", error);
      return;
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/connexion");
  };

  const getInitials = () => {
    const first = formData.firstName?.trim() || "";
    const partner = formData.partnerFirstName?.trim() || "";
    const firstInitial = first[0]?.toUpperCase() || "";
    const partnerInitial = partner[0]?.toUpperCase() || "";
    return `${firstInitial}${partnerInitial}` || email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = () => {
    const first = formData.firstName?.trim() || "";
    const partner = formData.partnerFirstName?.trim() || "";
    if (first && partner) {
      return `${first} & ${partner}`;
    }
    if (first) return first;
    if (partner) return partner;
    return email || "Mon profil";
  };

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {/* Header with Avatar */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative shrink-0">
            <div className="flex size-20 items-center justify-center rounded-full bg-henna/20 text-henna sm:size-24">
              <span className="font-heading text-2xl font-medium sm:text-3xl">
                {getInitials()}
              </span>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-henna text-white sm:size-8"
            >
              <Camera className="size-3.5 sm:size-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-heading text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
              {getDisplayName()}
            </h1>
            <p className="mt-1 text-sm text-ink-muted sm:text-base">
              Mon profil
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-md">
          <div className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="partnerFirstName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Prénom du partenaire
                </label>
                <input
                  type="text"
                  id="partnerFirstName"
                  value={formData.partnerFirstName}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerFirstName: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="partnerLastName"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Nom du partenaire
                </label>
                <input
                  type="text"
                  id="partnerLastName"
                  value={formData.partnerLastName}
                  onChange={(e) =>
                    setFormData({ ...formData, partnerLastName: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="weddingDate"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Date du mariage
                </label>
                <input
                  type="date"
                  id="weddingDate"
                  value={formData.weddingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, weddingDate: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="weddingLocation"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Lieu souhaité
                </label>
                <input
                  type="text"
                  id="weddingLocation"
                  value={formData.weddingLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, weddingLocation: e.target.value })
                  }
                  placeholder="Sousse"
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <Button
                onClick={handleSave}
                size="lg"
                className="h-11 w-full rounded-xl bg-henna px-6 hover:bg-henna/90"
              >
                {isSaved ? "Enregistré !" : "Enregistrer"}
              </Button>
            </div>
          </div>

          {/* Logout Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <LogOut className="size-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
