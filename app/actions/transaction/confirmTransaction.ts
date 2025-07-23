'use server';

import prisma from "@/app/libs/prismadb";

export async function confirmTransaction(reservationId: string) {
  try {
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "confirmed",
        etat: "payer",
        transactions: {
          updateMany: {
            where: { reservationId },
            data: { statut: "réussi" },
          },
        },
      },
    });

    return { success: true, data: updatedReservation };
  } catch (error) {
    console.error("Erreur confirmation :", error);
    return { success: false, message: "Erreur lors de la confirmation" };
  }
}
