// app/api/reservations/[reservationId]/confirm-payment/route.ts
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reservationId } = params;

    if (!reservationId || typeof reservationId !== 'string') {
      return NextResponse.json(
        { error: "ID de réservation invalide" }, 
        { status: 400 }
      );
    }

    // Vérifier que la réservation existe
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId
      },
      include: {
        listing: {
          include: {
            user: true
          }
        },
        user: true,
        transactions: true
      }
    });

    if (!existingReservation) {
      return NextResponse.json(
        { error: "Réservation introuvable" }, 
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est bien l'hôte (propriétaire du listing)
    if (existingReservation.listing.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à confirmer cette réservation" }, 
        { status: 403 }
      );
    }

    // Vérifier qu'il y a au moins une transaction réussie
    const hasSuccessfulTransaction = existingReservation.transactions?.some(
      (transaction) => transaction.statut === "réussi"
    );

    if (!hasSuccessfulTransaction) {
      return NextResponse.json(
        { error: "Aucune transaction réussie trouvée pour cette réservation" }, 
        { status: 400 }
      );
    }

    // Vérifier que le paiement n'est pas déjà confirmé par l'hôte
    if (existingReservation.status_hote === 'confirmed') {
      return NextResponse.json(
        { error: "Le paiement a déjà été confirmé" }, 
        { status: 400 }
      );
    }

    // Mettre à jour le status_hote à 'confirmed'
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status_hote: 'confirmed'
      },
      include: {
        listing: {
          include: {
            images: true,
            user: true
          }
        },
        user: true,
        transactions: true
      }
    });

    console.log(`✅ Paiement confirmé pour la réservation ${reservationId} par l'hôte ${currentUser.id}`);

    return NextResponse.json({
      message: "Paiement confirmé avec succès",
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Erreur lors de la confirmation de paiement:', error);
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la confirmation du paiement",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}