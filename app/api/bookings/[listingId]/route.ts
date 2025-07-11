// /api/bookings/[listingId]/route.ts
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

    const reservations = await prisma.reservation.findMany({
      where: { listingId },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    const allDates: { date: string }[] = [];

    for (const res of reservations) {
      if (!res.startDate || !res.endDate) continue;

      const current = new Date(res.startDate);
      const end = new Date(res.endDate);

      // normalisation des heures pour éviter le décalage
      current.setHours(12, 0, 0, 0);
      end.setHours(12, 0, 0, 0);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        allDates.push({ date: dateStr });

        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json(allDates);
  } catch (error) {
    console.error("Erreur API GET /bookings/[listingId] =>", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
