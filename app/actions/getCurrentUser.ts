// app/actions/getCurrentUser.ts - Version debug pour production
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export default async function getCurrentUser() {
  try {
    console.log("🔍 PROD: getCurrentUser - Début");
    console.log("🔍 PROD: NODE_ENV =", process.env.NODE_ENV);
    
    const session = await getServerSession(authOptions);
    console.log("🔍 PROD: Session =", session ? "✅ Trouvée" : "❌ Null");
    
    if (session) {
      console.log("🔍 PROD: Session user =", session.user);
      console.log("🔍 PROD: Session email =", session.user?.email);
    }
    
    if (!session?.user?.email) {
      console.log("🔍 PROD: Pas d'email, return null");
      return null;
    }

    console.log("🔍 PROD: Recherche user avec email:", session.user.email);

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        termsAcceptance: true,
      },
    });

    console.log("🔍 PROD: User trouvé en BDD =", currentUser ? "✅ Oui" : "❌ Non");
    
    if (!currentUser) {
      console.log("🔍 PROD: User pas trouvé, return null");
      return null;
    }

    console.log("🔍 PROD: Retour user ID:", currentUser.id);
    
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
      role: currentUser.role,
      termsAcceptance: currentUser.termsAcceptance
        ? {
            accepted: currentUser.termsAcceptance.accepted,
            createdAt: currentUser.termsAcceptance.createdAt.toISOString(),
          }
        : null,
    };
  } catch (error) {
    console.error("❌ PROD: Erreur getCurrentUser:", error);
    return null;
  }
}