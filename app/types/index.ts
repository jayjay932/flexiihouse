import { Listing, Reservation, User, ListingImage, UserRole } from "@prisma/client";

// ✅ Type pour un logement AVEC les informations de l'hôte
export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  images: { id: string; url: string }[];
  isActive?: boolean;
  user?: SafeUser; // ✅ Ajout des informations de l'hôte (propriétaire du listing)
};

// ✅ Type pour un utilisateur
export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  favoriteIds: string[];
  image: string | null;
  role: UserRole;
  termsAcceptance?: {
    accepted: boolean;
    createdAt: string;
  } | null;
};

// ✅ Type pour une transaction
export type SafeTransaction = {
  id: string;
  type_transaction: string;
  nom_mobile_money?: string | null;
  numero_mobile_money?: string | null;
  reference_transaction?: string | null;
  montant: number;
  devise: string;
  statut: string;
  date_transaction?: string | null;
  etat: string;
};

// ✅ Type pour une réservation
export type SafeReservation = {
  id: string;
  userId: string;
  listingId: string;
  totalPrice: number;
  message: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  status: string;
  motif: string;
  etat: string;
  rental_type: string;
  check_in_hours?: string | null;
  date_visite?: string | null;
  heure_visite?: string | null;
  type_transaction: string;
  code_reservation?: string | null;
  nom_mobile_money?: string | null;
  numero_mobile_money?: string | null;
  listing: SafeListing; // ✅ Contient maintenant les infos de l'hôte
  user: SafeUser; // ✅ Le client qui a fait la réservation
  transactions: SafeTransaction[]; // ✅ Les transactions associées
};