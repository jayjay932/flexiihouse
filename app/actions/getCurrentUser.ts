// app/actions/getCurrentUser.ts - Version corrigée pour JWT strategy
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
      console.log("🔍 PROD: Session user ID =", session.user?.id);
      console.log("🔍 PROD: Session email =", session.user?.email);
    }
   
    // ✅ CHANGEMENT PRINCIPAL : Utiliser session.user.id au lieu de session.user.email
    if (!session?.user?.id) {
      console.log("🔍 PROD: Pas d'ID utilisateur dans la session, return null");
      return null;
    }

    console.log("🔍 PROD: Recherche user avec ID:", session.user.id);

    // ✅ Vérification ObjectId valide pour MongoDB (24 caractères hexadécimaux)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(session.user.id);
    if (!isValidObjectId) {
      console.log("🔍 PROD: ID utilisateur invalide (pas un ObjectId):", session.user.id);
      return null;
    }
    
    // ✅ CHANGEMENT : Recherche par ID au lieu d'email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id }, // Utilise l'ID de la session
      include: {
        termsAcceptance: true,
      },
    });

    console.log("🔍 PROD: User trouvé en BDD =", currentUser ? "✅ Oui" : "❌ Non");
   
    if (!currentUser) {
      console.log("🔍 PROD: User pas trouvé avec ID:", session.user.id);
      return null;
    }

    console.log("🔍 PROD: Retour user ID:", currentUser.id);
    console.log("🔍 PROD: Retour user email:", currentUser.email);
   
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
    
    // ✅ Vérification de type pour accéder aux propriétés
    if (error instanceof Error) {
      console.error("❌ PROD: Stack trace:", error.stack);
      console.error("❌ PROD: Message:", error.message);
      
      // Log spécifique pour erreurs MongoDB/Prisma
      if (error.message?.includes('ObjectId')) {
        console.error("❌ PROD: Erreur ObjectId:", error.message);
      }
    }
    
    // ✅ Vérification pour les erreurs Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message?: string };
      if (prismaError.code === 'P2025') {
        console.error("❌ PROD: User introuvable dans MongoDB");
      }
    }
    
    return null;
  }
}