import prisma from '@/app/libs/prismadb';

interface IParams {
  listingId?: string;
}

export default async function getListingById(params: IParams) {
  try {
    const { listingId } = params;

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
      include: {
        user: true,
        images: true, // ✅ Inclure les images
      },
    });

    if (!listing) return null;

    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      images: listing.images.map((img) => ({
        url: img.url,
        id: img.id,
      })),
      user: {
        ...listing.user,
        createdAt: listing.user.createdAt.toISOString(),
        updatedAt: listing.user.updatedAt.toISOString(),
        emailVerified: listing.user.emailVerified?.toISOString() || null,
      },
    } as const; // ✅ Force TypeScript à inclure `images`
  } catch (error: any) {
    throw new Error(error);
  }
}
