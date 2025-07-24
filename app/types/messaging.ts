// types/messaging.ts

export interface MessageType {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface ConversationType {
  id: string;
  type: "general" | "listing" | "reservation";
  createdAt: string;
  lastMessageAt?: string;
  lastMessageText?: string;
  
  user1: {
    id: string;
    name: string;
    image?: string;
    email: string;
  };
  user2: {
    id: string;
    name: string;
    image?: string;
    email: string;
  };
  
  listing?: {
    id: string;
    title: string;
    images: { url: string }[];
  };
  
  messages: MessageType[];
  _count: {
    messages: number; // Nombre de messages non lus
  };
}