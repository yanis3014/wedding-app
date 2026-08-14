export type VendorCategory =
  | "Photographe"
  | "Traiteur"
  | "Lieu"
  | "Fleuriste"
  | "DJ"
  | "Vidéaste";

export type MockVendor = {
  id: string;
  name: string;
  category: VendorCategory;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  description: string;
  portfolio: string[];
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
  }>;
  pricing: Array<{
    name: string;
    description: string;
    price: number;
  }>;
};

export const mockVendors: MockVendor[] = [
  {
    id: "1",
    name: "Atelier Lumière",
    category: "Photographe",
    location: "Lyon, Rhône",
    rating: 4.9,
    reviewCount: 127,
    price: 800,
    description: "Photographe de mariage spécialisé dans les captures d'émotions authentiques. Nous accompagnons les couples depuis plus de 10 ans pour immortaliser leurs moments les plus précieux avec un style naturel et artistique.",
    portfolio: ["portfolio-1.jpg", "portfolio-2.jpg", "portfolio-3.jpg"],
    reviews: [
      {
        id: "r1",
        author: "Marie L.",
        rating: 5,
        date: "2024-06-15",
        comment: "Magnifique travail ! Nos photos sont parfaites, exactement ce qu'on espérait."
      },
      {
        id: "r2",
        author: "Thomas D.",
        rating: 5,
        date: "2024-05-20",
        comment: "Professionnel et créatif. Je recommande vivement !"
      }
    ],
    pricing: [
      {
        name: "Pack Essentiel",
        description: "Journée complète + 200 photos retouchées",
        price: 800
      },
      {
        name: "Pack Premium",
        description: "Week-end + album photo + 400 photos retouchées",
        price: 1500
      }
    ]
  },
  {
    id: "2",
    name: "Domaine des Vignes",
    category: "Lieu",
    location: "Bordeaux, Gironde",
    rating: 4.8,
    reviewCount: 89,
    price: 2500,
    description: "Domaine viticole exceptionnel pour votre mariage. Vignobles, jardins à la française et salles de réception d'exception pour un jour inoubliable au cœur du Bordelais.",
    portfolio: ["portfolio-1.jpg", "portfolio-2.jpg", "portfolio-3.jpg"],
    reviews: [
      {
        id: "r3",
        author: "Sophie M.",
        rating: 5,
        date: "2024-07-10",
        comment: "Cadre magnifique et équipe très professionnelle."
      }
    ],
    pricing: [
      {
        name: "Journée",
        description: "Location des lieux pour une journée",
        price: 2500
      },
      {
        name: "Week-end",
        description: "Location du vendredi au dimanche",
        price: 4500
      }
    ]
  },
  {
    id: "3",
    name: "Les Saveurs du Jour",
    category: "Traiteur",
    location: "Paris, Île-de-France",
    rating: 4.7,
    reviewCount: 203,
    price: 120,
    description: "Traiteur artisanal depuis 1995. Nous créons des menus personnalisés mettant en valeur les produits de saison et le savoir-faire français pour sublimer votre réception.",
    portfolio: ["portfolio-1.jpg", "portfolio-2.jpg", "portfolio-3.jpg"],
    reviews: [
      {
        id: "r4",
        author: "Jean-Pierre B.",
        rating: 4,
        date: "2024-06-01",
        comment: "Excellent repas, nos invités ont adoré."
      }
    ],
    pricing: [
      {
        name: "Formule Classique",
        description: "Entrée + plat + dessert par personne",
        price: 120
      },
      {
        name: "Formule Gastronomique",
        description: "Apéritif + entrée + plat + fromage + dessert par personne",
        price: 180
      }
    ]
  },
  {
    id: "4",
    name: "Pétales & Co",
    category: "Fleuriste",
    location: "Aix-en-Provence, Bouches-du-Rhône",
    rating: 5.0,
    reviewCount: 64,
    price: 450,
    description: "Artiste floral passionné par la création de compositions uniques. Du bouquet de la mariée à la décoration de la salle, nous transformons vos rêves en réalité florale.",
    portfolio: ["portfolio-1.jpg", "portfolio-2.jpg", "portfolio-3.jpg"],
    reviews: [
      {
        id: "r5",
        author: "Claire D.",
        rating: 5,
        date: "2024-08-05",
        comment: "Mes bouquets étaient sublimes, merci infiniment !"
      }
    ],
    pricing: [
      {
        name: "Bouquet mariée",
        description: "Bouquet personnalisé",
        price: 150
      },
      {
        name: "Décoration complète",
        description: "Bouquets + décorations salle + boutonnières",
        price: 450
      }
    ]
  },
];
