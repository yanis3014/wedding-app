"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type PrestatairesMapProps = {
  prestataires: any[];
};

export default function PrestatairesMap({ prestataires }: PrestatairesMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map centered on Sousse
    const mapInstance = L.map("map").setView([35.8256, 10.6084], 10);

    // Fix for default marker icons in Leaflet with Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    // Wait for map to be fully initialized
    mapInstance.whenReady(() => {
      setMap(mapInstance);
      setMapReady(true);
    });

    // Cleanup function
    return () => {
      // Clear all markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      // Remove map instance
      mapInstance.remove();
      setMap(null);
      setMapReady(false);
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    if (!mapReady || !map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for prestataires with coordinates
    prestataires.forEach((prestataire) => {
      // Use villes table data (new format) or fallback to direct latitude/longitude (old format)
      const lat = prestataire.villes?.latitude || prestataire.latitude;
      const lng = prestataire.villes?.longitude || prestataire.longitude;
      
      if (lat && lng) {
        const isValide = prestataire.statut_validation === "valide";
        const isPending = prestataire.statut_validation === "en_attente";

        // Create custom colored marker
        const markerColor = isValide ? "#4A7C59" : isPending ? "#D4A574" : "#8B5A2B";
        
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background-color: ${markerColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        try {
          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">
                ${prestataire.nom_entreprise}
              </h3>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                ${prestataire.categorie}
              </p>
              <div style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; ${
                isValide
                  ? "background-color: #4A7C5920; color: #4A7C59;"
                  : isPending
                  ? "background-color: #D4A57420; color: #D4A574;"
                  : "background-color: #8B5A2B20; color: #8B5A2B;"
              }">
                ${isValide ? "Validé" : isPending ? "En attente" : prestataire.statut_validation}
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersRef.current.push(marker);
        } catch (error) {
          console.error("Error adding marker to map:", error);
        }
      }
    });
  }, [mapReady, map, prestataires]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "600px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    />
  );
}
