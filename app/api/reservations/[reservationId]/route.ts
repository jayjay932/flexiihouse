import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  reservationId?: string;
}

// ❌ ANNULATION d'une réservation (client ou hôte)
export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { reservationId } = params;
  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid reservation ID");
  }

  const deleted = await prisma.reservation.deleteMany({
    where: {
      id: reservationId,
      OR: [
        { userId: currentUser.id },
        { listing: { userId: currentUser.id } }, // hôte du logement
      ],
    },
  });

  return NextResponse.json(deleted);
}

// ✅ VALIDATION d'une réservation (par l’hôte uniquement)
export async function PATCH(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { reservationId } = params;
  if (!reservationId || typeof reservationId !== "string") {
    throw new Error("Invalid reservation ID");
  }

  const updated = await prisma.reservation.updateMany({
    where: {
      id: reservationId,
      listing: { userId: currentUser.id }, // uniquement si c’est son logement
    },
    data: {
      status: "confirmed",
    },
  });

  return NextResponse.json(updated);
}
