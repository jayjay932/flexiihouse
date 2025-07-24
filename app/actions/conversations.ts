
// ========================
// 2. actions/conversations.ts
// ========================

import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

// Créer ou récupérer une conversation
export async function createOrGetConversation(otherUserId: string, listingId?: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Non connecté");
    }

    // Chercher une conversation existante
    let conversation = await (prisma as any).conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: currentUser.id,
            user2Id: otherUserId,
            listingId: listingId,
          },
          {
            user1Id: otherUserId,
            user2Id: currentUser.id,
            listingId: listingId,
          },
        ],
      },
      include: {
        user1: {
          select: { id: true, name: true, image: true, email: true },
        },
        user2: {
          select: { id: true, name: true, image: true, email: true },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
    });

    // Si pas trouvée, créer une nouvelle
    if (!conversation) {
      conversation = await (prisma as any).conversation.create({
        data: {
          user1Id: currentUser.id,
          user2Id: otherUserId,
          type: listingId ? "listing" : "general",
          listingId: listingId,
        },
        include: {
          user1: {
            select: { id: true, name: true, image: true, email: true },
          },
          user2: {
            select: { id: true, name: true, image: true, email: true },
          },
          listing: {
            select: {
              id: true,
              title: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      });
    }

    return conversation;
  } catch (error) {
    console.error("Erreur createOrGetConversation:", error);
    throw error;
  }
}

// Envoyer un message
export async function sendMessage(conversationId: string, content: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Non connecté");
    }

    // Créer le message
    const message = await (prisma as any).message.create({
      data: {
        content,
        senderId: currentUser.id,
        conversationId,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Mettre à jour la conversation
    await (prisma as any).conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: content,
      },
    });

    return message;
  } catch (error) {
    console.error("Erreur sendMessage:", error);
    throw error;
  }
}

// Récupérer toutes les conversations de l'utilisateur
export async function getUserConversations() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Non connecté");
    }

    const conversations = await (prisma as any).conversation.findMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
      },
      include: {
        user1: {
          select: { id: true, name: true, image: true, email: true },
        },
        user2: {
          select: { id: true, name: true, image: true, email: true },
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: { take: 1, select: { url: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderId: { not: currentUser.id },
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return conversations;
  } catch (error) {
    console.error("Erreur getUserConversations:", error);
    throw error;
  }
}

// Récupérer les messages d'une conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("Non connecté");
    }

    const messages = await (prisma as any).message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Marquer comme lu
    await (prisma as any).message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUser.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  } catch (error) {
    console.error("Erreur getConversationMessages:", error);
    throw error;
  }
}