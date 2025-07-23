// app/api/reservations/[reservationId]/archive/route.ts
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

    // Seuls les admins ou les propriétaires du listing peuvent archiver
    

    const { reservationId } = params;

    if (!reservationId) {
      return NextResponse.json({ error: "ID réservation requis" }, { status: 400 });
    }

    // Vérifier que la réservation existe et est annulée
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        listing: true,
      },
    });

    if (!existingReservation) {
      return NextResponse.json({ error: "Réservation non trouvée" }, { status: 404 });
    }

    if (existingReservation.status !== "cancelled") {
      return NextResponse.json({ error: "Seules les réservations annulées peuvent être archivées" }, { status: 400 });
    }

    // Vérifier que l'utilisateur est propriétaire du listing (si pas admin)
    if (currentUser.role !== "admin" && existingReservation.listing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Ajouter un champ "archived" ou supprimer la réservation selon votre préférence
    // Option 1: Marquer comme archivée (recommandé)
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId,
      },
      data: {
        // Vous pouvez ajouter un champ "archived" à votre schéma Prisma
        // archived: true,
        // Pour l'instant, on peut utiliser le motif pour indiquer l'archivage
        motif: `${existingReservation.motif || 'Annulé'} - Archivé le ${new Date().toISOString()}`,
      },
    });

    // Option 2: Supprimer complètement (moins recommandé car perte de données)
    // await prisma.reservation.delete({
    //   where: {
    //     id: reservationId,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: "Réservation archivée avec succès",
    });

  } catch (error) {
    console.error("Erreur archivage réservation:", error);
    return NextResponse.json(
      { 
        error: "Erreur interne du serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}