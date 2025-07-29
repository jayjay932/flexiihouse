// app/api/reservations/[reservationId]/validate-arrival/route.ts
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

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        id: reservationId
      },
      include: {
        listing: true,
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

    // Vérifier que l'utilisateur est bien le client de cette réservation
    if (existingReservation.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à valider cette réservation" }, 
        { status: 403 }
      );
    }

    // Vérifier que la réservation est dans un état qui permet la validation
    if (existingReservation.status !== 'confirmed') {
      return NextResponse.json(
        { error: "La réservation doit être confirmée par l'hôte avant validation d'arrivée" }, 
        { status: 400 }
      );
    }

    // Vérifier que le paiement est effectué
    const hasSuccessfulPayment = existingReservation.transactions?.some(
      (transaction) => transaction.statut === "réussi" && transaction.etat === "payer"
    );

    if (!hasSuccessfulPayment) {
      return NextResponse.json(
        { error: "Le paiement doit être validé avant de confirmer l'arrivée" }, 
        { status: 400 }
      );
    }

    // Vérifier que l'arrivée n'est pas déjà validée
    if (existingReservation.status_client === 'confirmed') {
      return NextResponse.json(
        { error: "L'arrivée a déjà été validée" }, 
        { status: 400 }
      );
    }

    // Mettre à jour le status_client à 'confirmed'
    const updatedReservation = await prisma.reservation.update({
      where: {
        id: reservationId
      },
      data: {
        status_client: 'confirmed'
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

    console.log(`✅ Arrivée validée pour la réservation ${reservationId} par le client ${currentUser.id}`);

    return NextResponse.json({
      message: "Arrivée validée avec succès",
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Erreur lors de la validation d\'arrivée:', error);
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la validation de l'arrivée",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}