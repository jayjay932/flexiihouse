'use server';

import prisma from "@/app/libs/prismadb";

export async function cancelTransaction(reservationId: string) {
  try {
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: "cancelled",
        transactions: {
          updateMany: {
            where: { reservationId },
            data: { statut: "échoué" },
          },
        },
      },
    });

    return { success: true, data: updatedReservation };
  } catch (error) {
    console.error("Erreur annulation :", error);
    return { success: false, message: "Erreur lors de l'annulation" };
  }
}
