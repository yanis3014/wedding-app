export const villesCoordonnees: Record<string, { lat: number; lng: number }> = {
  "Sousse": { lat: 35.8256, lng: 10.6084 },
  "Monastir": { lat: 35.7643, lng: 10.8113 },
  "Hammam Sousse": { lat: 35.8597, lng: 10.5928 },
  "Sfax": { lat: 34.7406, lng: 10.7603 },
  "Mahdia": { lat: 35.5047, lng: 11.0622 },
  "Kairouan": { lat: 35.6781, lng: 10.0963 },
  "El Jem": { lat: 35.6306, lng: 10.5717 },
  "Port El Kantaoui": { lat: 35.8947, lng: 10.5739 },
  "Hammamet": { lat: 36.4000, lng: 10.6167 },
  "Nabeul": { lat: 36.4556, lng: 10.7419 },
  "M'saken": { lat: 35.7333, lng: 10.6167 },
  "Kalaa Kebira": { lat: 35.6833, lng: 10.4667 },
  "Enfidha": { lat: 36.1167, lng: 10.3667 },
  "Béja": { lat: 36.7256, lng: 9.1836 },
  "Jendouba": { lat: 36.5019, lng: 8.7803 },
};

export function getCoordonneesVille(ville: string): { lat: number; lng: number } | null {
  // Case-insensitive search
  const normalizedVille = ville.toLowerCase().trim();
  for (const [key, coords] of Object.entries(villesCoordonnees)) {
    if (key.toLowerCase() === normalizedVille) {
      return coords;
    }
  }
  return null;
}
