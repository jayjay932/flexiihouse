
// 7. components/messaging/MessageButton.tsx (Bouton pour ListingInfo)
// ========================
"use client";

import { useState } from "react";
import { useConversations } from "@/app/hooks/useConversations";
import { useCurrentUser } from "@/app/hooks/useCurrentUser"; // 🆕 Nouveau hook
import { useRouter } from "next/navigation";

interface MessageButtonProps {
  otherUserId: string;
  otherUserName: string;
  listingId?: string;
}

export default function MessageButton({ otherUserId, otherUserName, listingId }: MessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const { createConversation } = useConversations();
  const { user } = useCurrentUser(); // 🆕 Utiliser le hook
  const router = useRouter();

  const handleClick = async () => {
    if (!user) {
      // Rediriger vers la page de login si pas connecté
      router.push("/login");
      return;
    }

    // Ne pas permettre de s'envoyer un message à soi-même
    if (user.id === otherUserId) {
      return;
    }

    try {
      setLoading(true);
      const conversation = await createConversation(otherUserId, listingId);
      
      // Rediriger vers la page de messagerie avec cette conversation
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ne pas afficher le bouton si c'est le même utilisateur
  if (user && user.id === otherUserId) {
    return null;
  }

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-5 rounded-xl transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 md:w-auto md:inline-flex md:items-center md:gap-2 md:py-2.5 md:px-4 text-sm"
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span className="ml-2 md:ml-1">
        {loading ? "..." : user ? "Envoyer un message" : "Se connecter pour envoyer un message"}
      </span>
    </button>
  );
}