import prisma from "@/app/libs/prismadb";
import { SafeReservation } from "@/app/types";

export default async function getAllReservations(): Promise<SafeReservation[]> {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: {
          include: {
            images: true,
          },
        },
        user: {
          include: {
            termsAcceptance: true,
          },
        },
        transactions: true, // ✅ Ajout des transactions associées
      },
    });

    const safeReservations: SafeReservation[] = reservations.map((reservation: any) => ({
      id: reservation.id,
      userId: reservation.userId,
      listingId: reservation.listingId,
      totalPrice: reservation.totalPrice,
      message: reservation.message || "",
      createdAt: reservation.createdAt.toISOString(),
      startDate: reservation.startDate?.toISOString() || "",
      endDate: reservation.endDate?.toISOString() || "",
      status: reservation.status,
      status_client: reservation.status_client || null, // ✅ Ajout de status_client
      status_hote: reservation.status_hote || null, // ✅ Ajout de status_hote
      motif: reservation.motif || "",
      etat: reservation.etat,
      rental_type: reservation.rental_type,
      check_in_hours: reservation.check_in_hours ?? null,
      date_visite: reservation.date_visite ?? null,
      heure_visite: reservation.heure_visite ?? null,
      type_transaction: reservation.type_transaction,
      code_reservation: reservation.code_reservation || null,
      nom_mobile_money: reservation.nom_mobile_money || null,
      numero_mobile_money: reservation.numero_mobile_money || null,
      listing: {
        ...reservation.listing,
        createdAt: reservation.listing.createdAt.toISOString(),
        images: reservation.listing.images.map((image: { id: string; url: string }) => ({
          id: image.id,
          url: image.url,
        })),
      },
      user: {
        id: reservation.user.id,
        name: reservation.user.name,
        email: reservation.user.email,
        numberPhone: reservation.user.numberPhone,
        hashedPassword: reservation.user.hashedPassword,
        createdAt: reservation.user.createdAt.toISOString(),
        updatedAt: reservation.user.updatedAt.toISOString(),
        emailVerified: reservation.user.emailVerified?.toISOString() || null,
        favoriteIds: reservation.user.favoriteIds || [],
        image: reservation.user.image || null,
        role: reservation.user.role,
        termsAcceptance: reservation.user.termsAcceptance
          ? {
              accepted: reservation.user.termsAcceptance.accepted,
              createdAt: reservation.user.termsAcceptance.createdAt.toISOString(),
            }
          : null,
      },
      transactions: reservation.transactions?.map((tx: any) => ({
        id: tx.id,
        type_transaction: tx.type_transaction,
        nom_mobile_money: tx.nom_mobile_money,
        numero_mobile_money: tx.numero_mobile_money,
        reference_transaction: tx.reference_transaction,
        montant: tx.montant,
        devise: tx.devise,
        statut: tx.statut,
        etat: tx.etat,
        date_transaction: tx.date_transaction?.toISOString(),
      })) || [],
    }));

    return safeReservations;
  } catch (error: any) {
    console.error("Erreur getAllReservations:", error);
    return [];
  }
}