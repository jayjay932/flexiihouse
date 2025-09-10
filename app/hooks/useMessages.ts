import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MessageType } from "@/app/types/messaging";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useCurrentUser();

  console.log("🔍 HOOK: useMessages - conversationId =", conversationId);
  console.log("🔍 HOOK: useMessages - user =", user ? `✅ ${user.id}` : "❌ Null");

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      console.log("🔍 HOOK: Pas de conversationId, skip fetchMessages");
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 HOOK: Début fetchMessages pour", conversationId);
      
      const response = await axios.get(`/api/conversations/${conversationId}/messages`);
      console.log("🔍 HOOK: Response status =", response.status);

      const messagesData = response.data as MessageType[];
      console.log("🔍 HOOK: Messages reçus =", messagesData.length);

      setMessages(messagesData);
    } catch (error: unknown) {
      console.error("❌ HOOK: Erreur fetchMessages:", error);

      // if (isAxiosError(error) && error.response) {
  //   console.error("❌ HOOK: Status =", error.response.status);
  //   console.error("❌ HOOK: Data =", error.response.data);
  // } else {
  //   console.error("❌ HOOK: Unknown error type");
  // }
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim() || !user) {
      console.log("🔍 HOOK: sendMessage - conditions non remplies", {
        conversationId: !!conversationId,
        content: !!content.trim(),
        user: !!user,
      });
      return;
    }

    const tempId = "temp-" + Date.now();

    try {
      setSending(true);
      console.log("🔍 HOOK: Envoi message...");

      const tempMessage: MessageType = {
        id: tempId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        senderId: user.id,
        conversationId,
        isRead: false,
        sender: {
          id: user.id,
          name: user.name || "Vous",
          image: user.image,
        },
      };

      setMessages((prev) => [...prev, tempMessage]);

      const response = await axios.post(`/api/conversations/${conversationId}/messages`, {
        content: content.trim(),
      });

      const realMessage = response.data as MessageType;
      console.log("🔍 HOOK: Message envoyé, ID =", realMessage.id);

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      );

      return realMessage;
    } catch (error: unknown) {
      console.error("❌ HOOK: Erreur sendMessage:", error);

      // rollback du message temporaire si erreur
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));

      throw error;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      console.log("🔍 HOOK: useEffect - reset et fetch pour", conversationId);
      setMessages([]);
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refreshMessages: fetchMessages,
  };
}
// Removed unused AxiosError function

