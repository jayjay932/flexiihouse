// ========================
// 3. app/api/conversations/route.ts
// ========================

import { NextRequest, NextResponse } from "next/server";
import { createOrGetConversation, getUserConversations } from "@/app/actions/conversations";

export async function GET() {
  try {
    const conversations = await getUserConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Erreur API conversations GET:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { otherUserId, listingId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: "L'ID de l'autre utilisateur est requis" },
        { status: 400 }
      );
    }

    const conversation = await createOrGetConversation(otherUserId, listingId);
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Erreur API conversations POST:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la conversation" },
      { status: 500 }
    );
  }
}
