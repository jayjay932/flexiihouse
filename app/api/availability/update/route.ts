import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, dates, isAvailable } = body;

    if (!listingId || !Array.isArray(dates) || typeof isAvailable !== "boolean") {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing || listing.userId !== user?.id) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Met à jour chaque date individuellement
    for (const dateString of dates) {
      const date = new Date(dateString);
      const existing = await prisma.availability.findUnique({
        where: {
          listingId_date: {
            listingId,
            date
          }
        }
      });

      if (existing) {
        await prisma.availability.update({
          where: {
            listingId_date: {
              listingId,
              date
            }
          },
          data: { isAvailable }
        });
      } else {
        await prisma.availability.create({
          data: {
            listingId,
            date,
            isAvailable
          }
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur API availability/update:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
