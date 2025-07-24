import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    // 🆕 Retourner null avec status 200 si pas d'utilisateur
    if (!currentUser) {
      return NextResponse.json(null, { status: 200 });
    }
    
    return NextResponse.json(currentUser, { status: 200 });
  } catch (error) {
    console.error("Erreur API current-user:", error);
    // 🆕 Retourner une erreur 500 pour les vraies erreurs
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}