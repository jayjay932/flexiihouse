import { Listing, Reservation, User, ListingImage } from "@prisma/client";

// ✅ Type pour un logement
export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  images: { id: string; url: string }[];
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
};

// ✅ Type pour une réservation avec logement + user inclus
export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListing;
  user: SafeUser; // ✅ AJOUT INDISPENSABLE
};
