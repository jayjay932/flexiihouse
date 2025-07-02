import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default async function getFavoriteListings() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return [];

  const favoriteListings = await prisma.listing.findMany({
    where: {
      id: {
        in: currentUser.favoriteIds,
      },
    },
    include: {
      images: true, // ✅ indispensable
    },
  });

  const safeListings = favoriteListings.map((listing) => ({
    ...listing,
    createdAt: listing.createdAt.toISOString(),
    images: listing.images.map((img) => ({
      id: img.id,
      url: img.url,
    })),
  }));

  return safeListings;
}
