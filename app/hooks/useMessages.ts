import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MessageType } from "@/app/types/messaging";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useCurrentUser(); // 🆕 Récupérer l'utilisateur actuel

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Erreur fetchMessages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !content.trim() || !user) return;

    const tempId = 'temp-' + Date.now();

    try {
      setSending(true);
      
      // 🆕 Créer un message temporaire avec les vraies infos utilisateur
      const tempMessage: MessageType = {
        id: tempId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        senderId: user.id,
        conversationId,
        isRead: false,
        sender: {
          id: user.id,
          name: user.name || 'Vous',
          image: user.image,
        },
      };

      // 🆕 Ajouter immédiatement le message temporaire
      setMessages(prev => [...prev, tempMessage]);
      
      // Envoyer le vrai message
      const response = await axios.post(
        `/api/conversations/${conversationId}/messages`,
        { content: content.trim() }
      );
      
      const realMessage = response.data;
      
      // 🆕 Remplacer le message temporaire par le vrai
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? realMessage : msg
        )
      );
      
      return realMessage;
    } catch (error) {
      console.error("Erreur sendMessage:", error);
      
      // 🆕 Supprimer le message temporaire en cas d'erreur
      setMessages(prev => 
        prev.filter(msg => msg.id !== tempId)
      );
      
      throw error;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      setMessages([]); // Reset messages
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