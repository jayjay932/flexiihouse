import { ListingImage } from "@prisma/client";
import prisma from "@/app/libs/prismadb";

export interface ReservationParams {
  userId?: string;
  listingId?: string;
  authorId?: string; // ✅
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
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
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
