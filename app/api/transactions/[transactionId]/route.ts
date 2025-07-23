// app/api/transactions/[transactionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  transactionId?: string;
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

    // Vérifier que l'utilisateur est admin
    if (currentUser.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé - Admin requis" }, { status: 403 });
    }

    const { transactionId } = params;
    const body = await request.json();
    const { statut, etat } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "ID transaction requis" }, { status: 400 });
    }

    // Vérifier que la transaction existe
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction non trouvée" }, { status: 404 });
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};
    
    if (statut) {
      // Valider les valeurs possibles pour le statut
      const validStatuts = ["en_attente", "réussi", "échoué"];
      if (!validStatuts.includes(statut)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      updateData.statut = statut;
    }

    if (etat) {
      // Valider les valeurs possibles pour l'état
      const validEtats = ["payer", "non_payer", "partiel"];
      if (!validEtats.includes(etat)) {
        return NextResponse.json({ error: "État invalide" }, { status: 400 });
      }
      updateData.etat = etat;
    }

    // Mettre à jour la transaction
    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: updateData,
    });

    // Si la transaction est marquée comme réussie et payée, 
    // mettre à jour aussi l'état de la réservation
    if (statut === "réussi" && etat === "payer") {
      await prisma.reservation.update({
        where: {
          id: existingTransaction.reservationId,
        },
        data: {
          etat: "payer",
        },
      });
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
    });

  } catch (error) {
    console.error("Erreur mise à jour transaction:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}