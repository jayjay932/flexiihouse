// 5. hooks/useConversations.ts
// ========================

import { useState, useEffect } from "react";
import axios from "axios";
import { ConversationType } from "@/app/types/messaging";

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Erreur fetchConversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string, listingId?: string) => {
    try {
      const response = await axios.post("/api/conversations", {
        otherUserId,
        listingId,
      });
      await fetchConversations(); // Rafraîchir la liste
      return response.data;
    } catch (error) {
      console.error("Erreur createConversation:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
  };
}
