import prisma from "@/app/libs/prismadb";
import { Listing } from "@prisma/client";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
}

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  images: { id: string; url: string }[]; // ✅ INCLUS DANS LE TYPE
};

export default async function getListings(
  params: IListingsParams
): Promise<SafeListing[]> {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      locationValue,
      startDate,
      endDate,
      category,
    } = params;

    let query: any = {};

    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (roomCount) query.roomCount = { gte: +roomCount };
    if (guestCount) query.guestCount = { gte: +guestCount };
    if (bathroomCount) query.bathroomCount = { gte: +bathroomCount };
    if (locationValue) query.locationValue = locationValue;

    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
            ],
          },
        },
      };
    }

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        images: true, // ✅ OBLIGATOIRE
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeListings: SafeListing[] = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      images: listing.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
    }));

    return safeListings;
  } catch (error: any) {
    throw new Error(error);
  }
}
