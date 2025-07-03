import { Listing, Reservation, User, ListingImage } from "@prisma/client";

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string; 
   images: { id: string; url: string }[]; // ✅ IMPORTANT
};

export type SafeReservation = Omit<
  Reservation,
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  listing: SafeListing;
    
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  favoriteIds: string[]; // ✅ ajoute cette ligne
   image: string | null; // ✅ ajoute cette ligne
};
