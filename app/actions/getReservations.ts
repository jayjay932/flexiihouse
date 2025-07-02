import prisma from "@/app/libs/prismadb";

export interface ReservationParams {
  userId?: string;
  listingId?: string;
}

export default async function getReservations(params: ReservationParams) {
  const { userId, listingId } = params;

  const query: any = {};

  if (userId) query.userId = userId;
  if (listingId) query.listingId = listingId;

  const reservations = await prisma.reservation.findMany({
    where: query,
    include: {
      listing: {
        include: {
          images: true, // important pour l'affichage
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reservations.map((reservation) => ({
    ...reservation,
    createdAt: reservation.createdAt.toISOString(),
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
    listing: {
      ...reservation.listing,
      createdAt: reservation.listing.createdAt.toISOString(),
      images: reservation.listing.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
    },
  }));
}
