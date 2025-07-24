// hooks/useCurrentUser.ts - Version avec debug
import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("🔍 Hook: Début fetchCurrentUser");
        
        const response = await fetch('/api/current-user');
        console.log("🔍 Hook: Response status:", response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log("🔍 Hook: User data reçue:", userData);
          setUser(userData);
        } else {
          console.log("🔍 Hook: Response pas OK");
        }
      } catch (error) {
        console.error("❌ Hook: Erreur:", error);
      } finally {
        setLoading(false);
        console.log("🔍 Hook: Loading terminé");
      }
    };

    fetchCurrentUser();
  }, []);

  console.log("🔍 Hook: État actuel - User:", user, "Loading:", loading);

  return {
    user,
    loading,
  };
}