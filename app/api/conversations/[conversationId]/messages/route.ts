// ========================
// 4. app/api/conversations/[conversationId]/messages/route.ts
// ========================

import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendMessage } from "@/app/actions/conversations";

interface RouteParams {
  params: {
    conversationId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = params;
    const messages = await getConversationMessages(conversationId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur API messages GET:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Le contenu du message est requis" },
        { status: 400 }
      );
    }

    const message = await sendMessage(conversationId, content.trim());
    return NextResponse.json(message);
  } catch (error) {
    console.error("Erreur API messages POST:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}