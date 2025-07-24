// app/api/current-user/route.ts - Version debug complète
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    console.log("🔍 API: /api/current-user appelée");
    console.log("🔍 API: Timestamp =", new Date().toISOString());
    
    const currentUser = await getCurrentUser();
    
    console.log("🔍 API: getCurrentUser terminé");
    console.log("🔍 API: Résultat =", currentUser ? "✅ User trouvé" : "❌ Null");
    
    if (currentUser) {
      console.log("🔍 API: User ID =", currentUser.id);
      console.log("🔍 API: User email =", currentUser.email);
    }
    
    // 🆕 Retourner null avec status 200 si pas d'utilisateur
    if (!currentUser) {
      console.log("🔍 API: Retour null avec status 200");
      return NextResponse.json(null, { status: 200 });
    }
   
    console.log("🔍 API: Retour user avec status 200");
    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    console.error("❌ API: Erreur complète:", error);
 
    // 🆕 Retourner une erreur 500 pour les vraies erreurs
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}