import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export default async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) return null;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        favoriteIds: true,
        numberPhone: true,
        hashedPassword: true,
        emailVerified: true,
        image: true,
      },
    });

    if (!currentUser) return null;

    return {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
      favoriteIds: currentUser.favoriteIds || [],
      image: currentUser.image || null,
    };
  } catch (error) {
    console.error("Erreur getCurrentUser:", error);
    return null;
  }
}
