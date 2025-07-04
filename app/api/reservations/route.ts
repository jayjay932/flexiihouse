import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// 🔐 Génère un code aléatoire avec préfixe
function generateCode(prefix: string, length: number = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Utilisateur non connecté" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      listingId,
      startDate,
      endDate,
      totalPrice,
      message,
      type_transaction,
      nom_mobile_money,
      numero_mobile_money,
      check_in_hours // ✅ nouvel argument
    } = body;

    if (!listingId || !startDate || !endDate || !totalPrice || !type_transaction) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
    }

    // Génération du code de réservation
    const code_reservation = generateCode("RSV");

    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        message,
        type_transaction,
        status: "pending",
        etat: "non_payer",
        rental_type: listing.rental_type as any,
        motif: null,
        check_in_hours: check_in_hours ? new Date(check_in_hours) : null, // ✅ conversion Date
        date_visite: null,
        heure_visite: null,
        code_reservation,
        nom_mobile_money: nom_mobile_money || null,
        numero_mobile_money: numero_mobile_money || null,
      }
    });

    // Génération de la référence transaction
    const reference_transaction = generateCode("TX");

    const transaction = await prisma.transaction.create({
      data: {
        reservationId: reservation.id,
        montant: totalPrice,
        type_transaction,
        statut: "en_attente",
        devise: "FCFA",
        date_transaction: new Date(),
        reference_transaction,
        nom_mobile_money: nom_mobile_money || null,
        numero_mobile_money: numero_mobile_money || null,
      }
    });

    return NextResponse.json({
      success: true,
      code_reservation,
      reference_transaction,
      reservation,
      transaction
    });

  } catch (error) {
    console.error("Erreur API réservation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
