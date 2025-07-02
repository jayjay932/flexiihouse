import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default async function getReservations() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        listing: {
          include: {
            images: true, // ✅ C’est ça qui manquait
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeReservations = reservations.map((reservation) => ({
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

    return safeReservations;
  } catch (error: any) {
    throw new Error(error);
  }
}
