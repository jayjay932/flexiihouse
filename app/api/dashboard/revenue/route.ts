import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { format } from "date-fns";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // Une seule date
  const start = searchParams.get("start"); // Plage de dates
  const end = searchParams.get("end");
// ... même import et currentUser

// On garde le comportement actuel pour les plages
let startDate: Date;
let endDate: Date;

const now = new Date();
const yearStart = new Date(now.getFullYear(), 0, 1);   // 1er janvier
const yearEnd = new Date(now.getFullYear(), 11, 31);  // 31 décembre

if (searchParams.get("date")) {
  startDate = new Date(searchParams.get("date")!);
  endDate = new Date(searchParams.get("date")!);
} else if (searchParams.get("start") && searchParams.get("end")) {
  startDate = new Date(searchParams.get("start")!);
  endDate = new Date(searchParams.get("end")!);
} else {
  // Si aucune période n’est sélectionnée, on retourne quand même le CA mensuel
  startDate = yearStart;
  endDate = yearEnd;
}

const reservations = await prisma.reservation.findMany({
  where: {
    status: "confirmed",
    listing: { userId: currentUser.id },
    AND: [
      { startDate: { lte: endDate } },
      { endDate: { gte: startDate } },
    ],
  },
  include: { listing: true },
});

let totalReservations = 0;
let totalNights = 0;
let totalPaidByClients = 0;
let totalToHost = 0;
const monthlyRevenue: Record<string, number> = {};

for (const res of reservations) {
  const resStart = new Date(res.startDate ?? 0);
  const resEnd = new Date(res.endDate ?? 0);

  const overlapStart = resStart < startDate ? startDate : resStart;
  const overlapEnd = resEnd > endDate ? endDate : resEnd;

  const nights = Math.max(
    0,
    Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24))
  );

  if (nights === 0) continue;

  const price = res.listing.price || 0;
  const commission = 5000;

  totalReservations++;
  totalNights += nights;
  totalPaidByClients += (price + commission) * nights;
  totalToHost += price * nights;

  // Répartition sur toute la période réelle (pas seulement filtrée)
  for (
    let d = new Date(resStart);
    d <= resEnd;
    d.setDate(d.getDate() + 1)
  ) {
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
