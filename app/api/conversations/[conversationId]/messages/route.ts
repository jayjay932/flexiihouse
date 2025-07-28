// app/api/conversations/[conversationId]/messages/route.ts
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log("🔍 MESSAGES API: GET appelé");
    console.log("🔍 MESSAGES API: conversationId =", params.conversationId);
    
    const currentUser = await getCurrentUser();
    console.log("🔍 MESSAGES API: currentUser =", currentUser ? `✅ ${currentUser.id}` : "❌ Null");

    if (!currentUser) {
      console.log("🔍 MESSAGES API: Pas d'utilisateur connecté");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // ✅ Récupérer la conversation avec user1 et user2 (pas "users")
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
    });

    if (!conversation) {
      console.log("🔍 MESSAGES API: Conversation non trouvée");
      return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
    }

    // ✅ Vérifier si l'utilisateur est user1 ou user2
    const isUserInConversation = 
      conversation.user1Id === currentUser.id || 
      conversation.user2Id === currentUser.id;
    
    console.log("🔍 MESSAGES API: User dans conversation =", isUserInConversation);
    console.log("🔍 MESSAGES API: user1Id =", conversation.user1Id);
    console.log("🔍 MESSAGES API: user2Id =", conversation.user2Id);
    console.log("🔍 MESSAGES API: currentUserId =", currentUser.id);

    if (!isUserInConversation) {
      console.log("🔍 MESSAGES API: User pas autorisé pour cette conversation");
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // ✅ Récupérer les messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log("🔍 MESSAGES API: Messages trouvés =", messages.length);
    if (messages.length > 0) {
      console.log("🔍 MESSAGES API: Premier message =", {
        id: messages[0].id,
        senderId: messages[0].senderId,
        content: messages[0].content.substring(0, 50) + '...',
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error("❌ MESSAGES API: Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log("🔍 MESSAGES API: POST appelé");
    
    const currentUser = await getCurrentUser();
    console.log("🔍 MESSAGES API: currentUser pour POST =", currentUser ? `✅ ${currentUser.id}` : "❌ Null");

    if (!currentUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // ✅ Vérifier que l'utilisateur fait partie de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      select: { user1Id: true, user2Id: true }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation non trouvée" }, { status: 404 });
    }

    const isUserInConversation = 
      conversation.user1Id === currentUser.id || 
      conversation.user2Id === currentUser.id;

    if (!isUserInConversation) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await request.json();
    console.log("🔍 MESSAGES API: Body =", body);

    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    // ✅ Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId: params.conversationId,
        senderId: currentUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // ✅ Mettre à jour la conversation avec le dernier message
    await prisma.conversation.update({
      where: { id: params.conversationId },
      data: {
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        lastMessageText: content,
      },
    });

    console.log("🔍 MESSAGES API: Message créé =", message.id);

    return NextResponse.json(message);
  } catch (error) {
    console.error("❌ MESSAGES API: Erreur POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}