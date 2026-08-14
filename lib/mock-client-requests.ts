import type { VendorCategory } from "./mock-vendors";

export type ClientRequestStatus = "new" | "pending" | "sent" | "confirmed";

export type ClientRequest = {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorCategory;
  status: ClientRequestStatus;
  quoteAmount?: number;
  sentDate: string;
  weddingDate: string;
  budget: string;
  hasReview?: boolean;
  existingReview?: {
    rating: number;
    comment: string;
    date: string;
  };
};

export const mockClientRequests: ClientRequest[] = [
  {
    id: "creq1",
    vendorId: "1",
    vendorName: "Atelier Lumière",
    vendorCategory: "Photographe",
    status: "confirmed",
    quoteAmount: 1500,
    sentDate: "2024-08-10",
    weddingDate: "2025-06-15",
    budget: "3000-5000",
    hasReview: true,
    existingReview: {
      rating: 5,
      comment: "Magnifique travail ! Nos photos sont parfaites, exactement ce qu'on espérait. Professionnel et créatif.",
      date: "2024-08-12",
    },
  },
  {
    id: "creq2",
    vendorId: "2",
    vendorName: "Domaine des Vignes",
    vendorCategory: "Lieu",
    status: "confirmed",
    quoteAmount: 4500,
    sentDate: "2024-08-12",
    weddingDate: "2025-06-15",
    budget: "5000-10000",
    hasReview: false,
  },
  {
    id: "creq3",
    vendorId: "3",
    vendorName: "Les Saveurs du Jour",
    vendorCategory: "Traiteur",
    status: "confirmed",
    quoteAmount: 180,
    sentDate: "2024-07-28",
    weddingDate: "2025-06-15",
    budget: "1000-3000",
    hasReview: false,
  },
  {
    id: "creq4",
    vendorId: "4",
    vendorName: "Pétales & Co",
    vendorCategory: "Fleuriste",
    status: "confirmed",
    quoteAmount: 450,
    sentDate: "2024-08-14",
    weddingDate: "2025-06-15",
    budget: "1000-3000",
    hasReview: false,
  },
  {
    id: "creq5",
    vendorId: "5",
    vendorName: "DJ Maxime",
    vendorCategory: "DJ",
    status: "pending",
    sentDate: "2024-08-15",
    weddingDate: "2025-06-15",
    budget: "500-1000",
  },
];
