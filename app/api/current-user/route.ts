import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: Request) {
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

    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    console.error("❌ API: Erreur complète:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
