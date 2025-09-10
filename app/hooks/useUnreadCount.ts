import { useState, useEffect } from "react";
import axios from "axios";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/messages/unread-count");
      setUnreadCount((response.data as { count: number }).count);
    } catch (err) {
      console.error("Erreur fetchUnreadCount:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    loading,
    refreshUnreadCount: fetchUnreadCount,
  };
}