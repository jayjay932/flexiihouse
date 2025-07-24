
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export default async function getCurrentUser() {
  try {
    console.log("🔍 getCurrentUser - Début");
    
    const session = await getServerSession(authOptions);
    console.log("🔍 Session:", session ? "✅ Trouvée" : "❌ Pas de session");
    
    if (!session?.user?.email) {
      console.log("🔍 Pas d'email dans la session");
      return null;
    }

    console.log("🔍 Email de session:", session.user.email);

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        termsAcceptance: true,
      },
    });

    console.log("🔍 Utilisateur BDD:", currentUser ? "✅ Trouvé" : "❌ Pas trouvé");

    if (!currentUser) return null;

    const result = {
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
      role: currentUser.role,
      termsAcceptance: currentUser.termsAcceptance
        ? {
            accepted: currentUser.termsAcceptance.accepted,
            createdAt: currentUser.termsAcceptance.createdAt.toISOString(),
          }
        : null,
    };

    console.log("🔍 Retour utilisateur avec ID:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Erreur getCurrentUser:", error);
    return null;
  }
}