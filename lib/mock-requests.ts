export type RequestStatus = "new" | "sent" | "confirmed";

export type MockRequest = {
  id: string;
  clientName: string;
  status: RequestStatus;
  weddingDate: string;
  budget: string;
  message: string;
  createdAt: string;
};

export const mockRequests: MockRequest[] = [
  {
    id: "req1",
    clientName: "Marie Dupont",
    status: "new",
    weddingDate: "2025-06-15",
    budget: "3000-5000",
    message: "Nous recherchons un photographe pour notre mariage de 120 personnes. Nous aimons votre style naturel et artistique.",
    createdAt: "2024-08-10",
  },
  {
    id: "req2",
    clientName: "Thomas Martin",
    status: "sent",
    weddingDate: "2025-09-20",
    budget: "1000-3000",
    message: "Mariage intimiste avec 50 invités. Nous souhaitons une couverture de la cérémonie et du repas.",
    createdAt: "2024-08-05",
  },
  {
    id: "req3",
    clientName: "Sophie Bernard",
    status: "confirmed",
    weddingDate: "2025-04-12",
    budget: "5000-10000",
    message: "Mariage sur deux jours avec reportage complet. Nous avons adoré votre portfolio !",
    createdAt: "2024-07-28",
  },
  {
    id: "req4",
    clientName: "Jean-Pierre Leroy",
    status: "new",
    weddingDate: "2025-07-08",
    budget: "1000-3000",
    message: "Cérémonie laïque en extérieur, suivi d'un cocktail. Besoin de photos de groupe et photos spontanées.",
    createdAt: "2024-08-12",
  },
];

export const mockDashboardStats = {
  newRequests: 2,
  pendingQuotes: 1,
  responseRate: 87,
};
