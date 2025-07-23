// app/api/reservations/[reservationId]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  reservationId?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { reservationId } = params;

    if (!reservationId) {
      return NextResponse.json({ error: "ID réservation requis" }, { status: 400 });
    }

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
    });

    if (!existingReservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    if (existingReservation.userId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Mettre à jour le statut à "cancelled"
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        status: "cancelled",
        motif: "Annulé par le client",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Réservation annulée avec succès",
    });

  } catch (error) {
    console.error("Erreur annulation réservation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}