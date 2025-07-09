import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function GET(
  request: Request,
  { params }: { params: IParams }
) {
  try {
    const listingId = params.listingId;

    if (!listingId) {
      return NextResponse.json({ error: "listingId manquant" }, { status: 400 });
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        listingId: listingId,
        isAvailable: false
      },
      select: {
        date: true
      }
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    console.error("Erreur API GET /availability/:id =>", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
