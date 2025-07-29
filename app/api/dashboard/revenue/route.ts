import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format, differenceInCalendarDays } from "date-fns";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const singleDate = searchParams.get("date");

  let startDate: Date;
  let endDate: Date;

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  if (singleDate !== null) {
    startDate = new Date(singleDate);
    endDate = new Date(singleDate);
  } else if (start !== null && end !== null) {
    startDate = new Date(start);
    endDate = new Date(end);
  } else {
    startDate = yearStart;
    endDate = yearEnd;
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "confirmed",
      listing: {
        userId: currentUser.id,
      },
      AND: [
        { startDate: { lte: endDate } },
        { endDate: { gte: startDate } },
      ],
    },
    include: {
      listing: true,
    },
  });

  let totalReservations = 0;
  let totalNights = 0;
  let totalPaidByClients = 0;
  let totalToHost = 0;
  const monthlyRevenue: Record<string, number> = {};

  for (const res of reservations) {
    if (!res.startDate || !res.endDate) continue;

    const resStart = new Date(res.startDate);
    const resEnd = new Date(res.endDate);

    // Calculer l'intervalle réellement chevauchant la période sélectionnée
    const overlapStart = resStart < startDate ? startDate : resStart;
    const overlapEnd = resEnd > endDate ? endDate : resEnd;

    // Exclure la date de départ (non inclusif)
    const nights = Math.max(
      0,
      differenceInCalendarDays(overlapEnd, overlapStart)
    );

    if (nights === 0) continue;

    const price = res.listing.price || 0;
    const commission = 1000;

    totalReservations++;
    totalNights += nights;
    totalPaidByClients += (price ) * nights;
    totalToHost +=(price-commission) * nights;

    // Revenu mensuel pour les nuits dans la période seulement
    for (let d = new Date(overlapStart); d < overlapEnd; d.setDate(d.getDate() + 1)) {
      const key = format(d, "yyyy-MM");
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + price;
    }
  }

  return NextResponse.json({
    totalReservations,
    totalNights,
    totalPaidByClients,
    totalToHost,
    totalCommission: totalPaidByClients - totalToHost,
    monthlyRevenue,
  });
}
