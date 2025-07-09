import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export default async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return null;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        termsAcceptance: true, // ✅ Inclure la relation
      },
    });

    if (!currentUser) return null;

    return {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      numberPhone: currentUser.numberPhone,
      hashedPassword: currentUser.hashedPassword,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
      favoriteIds: currentUser.favoriteIds || [],
      image: currentUser.image || null,

      // ✅ Ajout de termsAcceptance
      termsAcceptance: currentUser.termsAcceptance
        ? {
            accepted: currentUser.termsAcceptance.accepted,
            createdAt: currentUser.termsAcceptance.createdAt.toISOString(),
          }
        : null,
    };
  } catch (error) {
    console.error("Erreur getCurrentUser:", error);
    return null;
  }
}
