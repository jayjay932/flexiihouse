import { ListingImage } from "@prisma/client";
import prisma from "@/app/libs/prismadb";

export interface ReservationParams {
  userId?: string;
  listingId?: string;
  authorId?: string;
}

export default async function getReservations(params: ReservationParams) {
  const { userId, listingId, authorId } = params;
  const query: any = {};
  
  if (userId) query.userId = userId;
  if (listingId) query.listingId = listingId;
  
  const reservations = await prisma.reservation.findMany({
    where: {
      ...query,
      ...(authorId && {
        listing: {
          userId: authorId,
        },
      }),
    },
    include: {
      listing: {
        include: {
          images: true,
          user: true, // ✅ Inclure l'utilisateur propriétaire du listing (l'hôte)
        },
      },
      user: true, // ✅ L'utilisateur qui a fait la réservation (le client)
      transactions: true, // ✅ Inclure les transactions
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reservations.map((reservation: any) => ({
    ...reservation,
    createdAt: reservation.createdAt.toISOString(),
    startDate: reservation.startDate ? reservation.startDate.toISOString() : null,
    endDate: reservation.endDate ? reservation.endDate.toISOString() : null,
    check_in_hours: reservation.check_in_hours ? reservation.check_in_hours.toISOString() : null,
    date_visite: reservation.date_visite ? reservation.date_visite.toISOString() : null,
    heure_visite: reservation.heure_visite ? reservation.heure_visite.toISOString() : null,
    
    listing: {
      ...reservation.listing,
      createdAt: reservation.listing.createdAt.toISOString(),
      images: reservation.listing.images.map((img: ListingImage) => ({
        id: img.id,
        url: img.url,
      })),
      // ✅ Ajouter les informations de l'hôte (propriétaire du listing)
      user: {
        id: reservation.listing.user.id,
        name: reservation.listing.user.name,
        email: reservation.listing.user.email,
        numberPhone: reservation.listing.user.numberPhone,
        image: reservation.listing.user.image,
        createdAt: reservation.listing.user.createdAt.toISOString(),
        updatedAt: reservation.listing.user.updatedAt.toISOString(),
        emailVerified: reservation.listing.user.emailVerified?.toISOString() || null,
        role: reservation.listing.user.role,
        hashedPassword: reservation.listing.user.hashedPassword,
        favoriteIds: reservation.listing.user.favoriteIds,
      },
    },
    
    // ✅ L'utilisateur qui a fait la réservation (le client)
    user: {
      ...reservation.user,
      createdAt: reservation.user.createdAt.toISOString(),
      updatedAt: reservation.user.updatedAt.toISOString(),
      emailVerified: reservation.user.emailVerified
        ? reservation.user.emailVerified.toISOString()
        : null,
    },

    // ✅ Mapper les transactions
    transactions: reservation.transactions?.map((tx: any) => ({
      id: tx.id,
      type_transaction: tx.type_transaction,
      nom_mobile_money: tx.nom_mobile_money,
      numero_mobile_money: tx.numero_mobile_money,
      reference_transaction: tx.reference_transaction,
      montant: tx.montant,
      devise: tx.devise,
      statut: tx.statut,
      date_transaction: tx.date_transaction?.toISOString(),
      etat: tx.etat,
    })) || [],
  }));
}