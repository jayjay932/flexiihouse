// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

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
      check_in_hours,
      date_visite,
      heure_visite
    } = body;

    if (!listingId || !type_transaction) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
    }

    const rental_type = listing.rental_type as any;

    // Générer un code de réservation
    const code_reservation = generateCode("RSV");

    const isCourte = rental_type === "courte";

    // Vérifications spécifiques à chaque type de réservation
    if (isCourte) {
      if (!startDate || !endDate || !totalPrice) {
        return NextResponse.json({ error: "Dates de réservation requises pour une location courte." }, { status: 400 });
      }
    } else {
      if (!date_visite || !heure_visite) {
        return NextResponse.json({ error: "Date et heure de visite requises pour une location mensuelle." }, { status: 400 });
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        startDate: isCourte ? new Date(startDate) : null,
        endDate: isCourte ? new Date(endDate) : null,
        totalPrice: isCourte ? totalPrice : parseInt(listing.prix_viste.toString(), 10),
        message: message || null,
        type_transaction,
        status: "pending",
        etat: "non_payer",
        rental_type,
        motif: null,
        check_in_hours: check_in_hours ? new Date(check_in_hours) : null,
        date_visite: !isCourte ? new Date(date_visite) : null,
        heure_visite: !isCourte ? new Date(`1970-01-01T${heure_visite}:00Z`) : null,
        code_reservation,
        nom_mobile_money: nom_mobile_money || null,
        numero_mobile_money: numero_mobile_money || null,
      }
    });

    const reference_transaction = generateCode("TX");

    const transaction = await prisma.transaction.create({
      data: {
        reservationId: reservation.id,
        montant: isCourte ? totalPrice : parseInt(listing.prix_viste.toString(), 10),
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
