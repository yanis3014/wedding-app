"use client";

import { Check, Clock, LogOut, Plus, X, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { deletePortfolioPhoto, getPortfolioPhotos, uploadPortfolioPhoto } from "@/lib/supabase/portfolio";
import { createTarif, deleteTarif, getTarifs } from "@/lib/supabase/tarifs";

type ProfilFormProps = {
  prestataireData: any;
  tarifMensuel: number | null;
};

export default function ProfilForm({ prestataireData, tarifMensuel }: ProfilFormProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    location: prestataireData?.zone_intervention || "",
    description: prestataireData?.description || "",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [portfolioPhotos, setPortfolioPhotos] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tarifs, setTarifs] = useState<any[]>([]);
  const [showTarifForm, setShowTarifForm] = useState(false);
  const [newTarif, setNewTarif] = useState({ nom: "", description: "", prix: "" });
  const [disponibilites, setDisponibilites] = useState<any[]>([]);
  const [showDispoForm, setShowDispoForm] = useState(false);
  const [newDispo, setNewDispo] = useState({ date_dispo: "", heure_debut: "", heure_fin: "" });

  // Load portfolio photos on mount
  useEffect(() => {
    const loadPhotos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const photos = await getPortfolioPhotos(user.id);
          setPortfolioPhotos(photos);
        } catch (error) {
          console.error("Error loading photos:", error);
        }
      }
    };
    loadPhotos();
  }, [supabase]);

  // Load tarifs on mount
  useEffect(() => {
    const loadTarifs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const tarifData = await getTarifs(user.id);
          setTarifs(tarifData);
        } catch (error) {
          console.error("Error loading tarifs:", error);
        }
      }
    };
    loadTarifs();
  }, [supabase]);

  // Sync form data with prestataireData when it changes
  useEffect(() => {
    if (prestataireData) {
      setFormData({
        location: prestataireData.zone_intervention || "",
        description: prestataireData.description || "",
      });
    }
  }, [prestataireData]);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No user found");
      return;
    }

    const { error } = await supabase
      .from("prestataires")
      .update({
        zone_intervention: formData.location || null,
        description: formData.description || null,
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
    window.location.href = "/connexion";
  };

  const getInitials = () => {
    const name = prestataireData?.nom_entreprise || "";
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "PR";
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check limit
    if (portfolioPhotos.length + files.length > 10) {
      alert("Maximum 10 photos autorisées. Supprimez-en d'abord.");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        const photo = await uploadPortfolioPhoto(file, user.id);
        setPortfolioPhotos(prev => [...prev, photo]);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Erreur lors de l'upload des photos");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await deletePortfolioPhoto(photoId, user.id);
      setPortfolioPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Erreur lors de la suppression de la photo");
    }
  };

  const handleAddTarif = async () => {
    if (!newTarif.nom || !newTarif.prix) {
      alert("Veuillez remplir le nom et le prix");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const tarif = await createTarif(user.id, {
        nom: newTarif.nom,
        description: newTarif.description,
        prix: parseInt(newTarif.prix),
      });
      setTarifs(prev => [...prev, tarif]);
      setNewTarif({ nom: "", description: "", prix: "" });
      setShowTarifForm(false);
    } catch (error) {
      console.error("Error creating tarif:", error);
      alert("Erreur lors de la création du tarif");
    }
  };

  const handleDeleteTarif = async (tarifId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await deleteTarif(tarifId, user.id);
      setTarifs(prev => prev.filter(t => t.id !== tarifId));
    } catch (error) {
      console.error("Error deleting tarif:", error);
      alert("Erreur lors de la suppression du tarif");
    }
  };

  // Load disponibilités on mount
  useEffect(() => {
    const loadDisponibilites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("disponibilites")
          .select("*")
          .eq("prestataire_id", user.id)
          .eq("statut", "disponible")
          .order("date_dispo", { ascending: true });
        
        if (error) {
          console.error("Error loading disponibilités:", error);
        } else {
          setDisponibilites(data || []);
        }
      }
    };
    loadDisponibilites();
  }, [supabase]);

  const handleAddDispo = async () => {
    if (!newDispo.date_dispo || !newDispo.heure_debut || !newDispo.heure_fin) {
      alert("Veuillez remplir la date et les heures");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("disponibilites")
        .insert({
          prestataire_id: user.id,
          date_dispo: newDispo.date_dispo,
          heure_debut: newDispo.heure_debut,
          heure_fin: newDispo.heure_fin,
          statut: "disponible",
        })
        .select()
        .single();

      if (error) throw error;

      setDisponibilites(prev => [...prev, data]);
      setNewDispo({ date_dispo: "", heure_debut: "", heure_fin: "" });
      setShowDispoForm(false);
    } catch (error) {
      console.error("Error creating disponibilité:", error);
      alert("Erreur lors de la création du créneau");
    }
  };

  const handleDeleteDispo = async (dispoId: string) => {
    try {
      const { error } = await supabase
        .from("disponibilites")
        .delete()
        .eq("id", dispoId);

      if (error) throw error;

      setDisponibilites(prev => prev.filter(d => d.id !== dispoId));
    } catch (error) {
      console.error("Error deleting disponibilité:", error);
      alert("Erreur lors de la suppression du créneau");
    }
  };

  const isAccountValidated = prestataireData?.statut_validation === "valide";

  return (
    <div className="flex min-h-screen flex-col bg-porcelain">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 pb-28 sm:px-6 sm:py-14 sm:pb-28">
        {/* Cover Banner */}
        <div className="relative mb-16 h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px]">
          <div className="absolute inset-0 bg-gradient-to-br from-henna to-rose" />
        </div>

        {/* Avatar + Name + Badges */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative shrink-0">
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-henna/20 text-henna sm:size-24">
              <span className="font-heading text-2xl font-medium sm:text-3xl">
                {getInitials()}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <h1 className="font-heading text-2xl font-medium leading-tight tracking-tight text-ink sm:text-3xl">
              {prestataireData?.nom_entreprise || "Mon entreprise"}
            </h1>
            <div className="mt-2 flex flex-col items-center gap-2 sm:items-start sm:justify-start">
              <div className="flex items-center gap-2">
                {isAccountValidated ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1 text-xs font-medium text-sage">
                    <Check className="size-3.5" />
                    <span>Profil validé</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-full bg-goldSoft/20 px-3 py-1 text-xs font-medium text-goldSoft">
                    <Clock className="size-3.5" />
                    <span>En attente de validation</span>
                  </div>
                )}
              </div>
              
              {/* Subscription Status */}
              {prestataireData?.abonnement_statut && (
                <div className="rounded-lg px-3 py-1.5 text-xs">
                  {prestataireData.abonnement_statut === "essai" && (
                    <div className="flex flex-col gap-0.5 rounded-md bg-goldSoft/10 px-2 py-1">
                      <p className="font-medium text-goldSoft">
                        Essai gratuit jusqu'au{" "}
                        {prestataireData.essai_fin_date
                          ? new Date(prestataireData.essai_fin_date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                      {tarifMensuel && (
                        <p className="text-[10px] text-ink-muted">
                          Tarif à l'issue : {tarifMensuel} DT/mois
                        </p>
                      )}
                    </div>
                  )}
                  {prestataireData.abonnement_statut === "actif" && (
                    <p className="rounded-md bg-sage/10 px-2 py-1 font-medium text-sage">
                      Abonnement actif{" "}
                      {tarifMensuel && `— ${tarifMensuel} DT/mois`}
                    </p>
                  )}
                  {(prestataireData.abonnement_statut === "expire" ||
                    prestataireData.abonnement_statut === "suspendu") && (
                    <p className="rounded-md bg-henna/10 px-2 py-1 font-medium text-henna">
                      {prestataireData.abonnement_statut === "expire"
                        ? "Abonnement expiré"
                        : "Abonnement suspendu"}
                      — Contactez l'équipe
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8 flex gap-3 border-b border-black/10 pb-4">
          <Link
            href="/pro/dashboard"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Tableau de bord
          </Link>
          <Link
            href="/pro/profil"
            className="rounded-lg bg-henna/10 px-4 py-2 text-sm font-medium text-henna"
          >
            Mon profil
          </Link>
          <Link
            href="/pro/avis"
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
          >
            Avis reçus
          </Link>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-4">
              <div className="sm:col-span-2">
                <label
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Catégorie
                </label>
                <div className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/40 px-3 py-2.5 text-sm text-ink-muted">
                  {prestataireData?.categorie || "Non définie"}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Zone d'intervention
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ex: Tunis, Sousse, Monastir"
                  className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Décrivez vos services et votre expérience..."
                  className="w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                />
              </div>
            </div>
          </div>

          {/* Portfolio Card */}
          <div className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                  Portfolio
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {portfolioPhotos.length}/10 photos
                </p>
              </div>
              {portfolioPhotos.length >= 10 && (
                <p className="text-xs text-henna">Limite atteinte</p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {portfolioPhotos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.url}
                    alt="Portfolio"
                    className="size-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handlePhotoDelete(photo.id)}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-henna/90 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {portfolioPhotos.length < 10 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-porcelain/40 text-ink-muted transition-colors hover:border-henna/50 hover:text-henna disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="size-6 animate-spin rounded-full border-2 border-henna border-t-transparent" />
                    ) : (
                      <Plus className="size-6" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tarifs Card */}
          <div className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-medium text-ink sm:text-2xl">
                  Mes formules
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Vos tarifs détaillés
                </p>
              </div>
              {!showTarifForm && (
                <button
                  type="button"
                  onClick={() => setShowTarifForm(true)}
                  className="flex items-center gap-2 rounded-lg bg-henna/10 px-4 py-2 text-sm font-medium text-henna hover:bg-henna/20"
                >
                  <Plus className="size-4" />
                  Ajouter une formule
                </button>
              )}
            </div>

            {showTarifForm && (
              <div className="mb-6 rounded-lg bg-porcelain/60 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Nom de la formule
                    </label>
                    <input
                      type="text"
                      value={newTarif.nom}
                      onChange={(e) => setNewTarif({ ...newTarif, nom: e.target.value })}
                      placeholder="Ex: Formule Essentielle"
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newTarif.description}
                      onChange={(e) => setNewTarif({ ...newTarif, description: e.target.value })}
                      placeholder="Ex: Forfait mariage complet"
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Prix (DT)
                    </label>
                    <input
                      type="number"
                      value={newTarif.prix}
                      onChange={(e) => setNewTarif({ ...newTarif, prix: e.target.value })}
                      placeholder="1500"
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink placeholder:text-ink-muted/70 outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleAddTarif}
                    size="sm"
                    className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90"
                  >
                    Ajouter
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTarifForm(false);
                      setNewTarif({ nom: "", description: "", prix: "" });
                    }}
                    className="h-9 rounded-lg border border-black/10 px-4 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {tarifs.length === 0 && !showTarifForm ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-porcelain/40 p-8 text-center">
                <p className="text-sm text-ink-muted">
                  Aucune formule définie
                </p>
                <p className="mt-1 text-xs text-ink-muted/70">
                  Ajoutez vos tarifs pour informer vos clients
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tarifs.map((tarif) => (
                  <div key={tarif.id} className="rounded-xl border border-black/10 bg-porcelain/40 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-heading text-base font-medium text-ink">
                        {tarif.nom}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteTarif(tarif.id)}
                        className="flex size-6 items-center justify-center rounded-full text-ink-muted hover:bg-henna/10 hover:text-henna"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    {tarif.description && (
                      <p className="mb-2 text-sm text-ink-muted">
                        {tarif.description}
                      </p>
                    )}
                    <p className="font-heading text-lg font-medium text-henna">
                      {tarif.prix} DT
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disponibilités Card */}
          <div className="rounded-[14px] border border-black/10 bg-card p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-medium text-ink sm:text-xl">
                Mes disponibilités
              </h2>
              {!showDispoForm && (
                <Button
                  onClick={() => setShowDispoForm(true)}
                  size="sm"
                  className="h-8 rounded-lg bg-henna px-3 hover:bg-henna/90"
                >
                  <Plus className="mr-1 size-4" />
                  Ajouter
                </Button>
              )}
            </div>

            {showDispoForm && (
              <div className="mb-4 rounded-xl bg-porcelain/40 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newDispo.date_dispo}
                      onChange={(e) => setNewDispo({ ...newDispo, date_dispo: e.target.value })}
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Heure début
                    </label>
                    <input
                      type="time"
                      value={newDispo.heure_debut}
                      onChange={(e) => setNewDispo({ ...newDispo, heure_debut: e.target.value })}
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">
                      Heure fin
                    </label>
                    <input
                      type="time"
                      value={newDispo.heure_fin}
                      onChange={(e) => setNewDispo({ ...newDispo, heure_fin: e.target.value })}
                      className="h-10 w-full rounded-lg border border-black/10 bg-porcelain/60 px-3 text-sm text-ink outline-none ring-henna/30 focus:border-henna/50 focus:ring-2"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleAddDispo}
                    size="sm"
                    className="h-9 rounded-lg bg-henna px-4 hover:bg-henna/90"
                  >
                    Ajouter
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDispoForm(false);
                      setNewDispo({ date_dispo: "", heure_debut: "", heure_fin: "" });
                    }}
                    className="h-9 rounded-lg border border-black/10 px-4 text-sm font-medium text-ink-muted hover:bg-porcelain/60"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {disponibilites.length === 0 && !showDispoForm ? (
              <div className="flex flex-col items-center justify-center rounded-xl bg-porcelain/40 p-8 text-center">
                <Calendar className="mb-2 size-8 text-ink-muted" />
                <p className="text-sm text-ink-muted">
                  Aucun créneau disponible
                </p>
                <p className="mt-1 text-xs text-ink-muted/70">
                  Ajoutez vos disponibilités pour permettre aux clients de prendre rendez-vous
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {disponibilites.map((dispo) => (
                  <div key={dispo.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-porcelain/40 p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="size-5 text-henna" />
                      <div>
                        <p className="font-medium text-ink">
                          {new Date(dispo.date_dispo).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-ink-muted">
                          {dispo.heure_debut} - {dispo.heure_fin}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDispo(dispo.id)}
                      className="flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-henna/10 hover:text-henna"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              size="lg"
              className="h-11 w-full rounded-xl bg-henna px-6 hover:bg-henna/90"
            >
              {isSaved ? "Profil enregistré !" : "Enregistrer le profil"}
            </Button>
          </div>

          {/* Logout Link */}
          <div className="mt-4 text-center">
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
