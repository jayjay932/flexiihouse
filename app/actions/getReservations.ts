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
        },
      },
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
    },
  }));
}
