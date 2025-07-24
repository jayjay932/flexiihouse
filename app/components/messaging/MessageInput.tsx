"use client";

import { useState } from "react";
import { useMessages } from "@/app/hooks/useMessages";
import { Send, Plus } from "lucide-react";

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, sending } = useMessages(conversationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!message.trim() || sending) return;
    try {
      await sendMessage(message);
      setMessage("");
     
      // Rechargement immédiat pour voir le message
      window.location.reload();
     
    } catch (error) {
      console.error("Erreur envoi message:", error);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Zone de saisie mobile-first */}
      <div className="p-3 sm:p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end space-x-3">
            {/* Bouton d'ajout (style Airbnb) - affiché uniquement sur mobile */}
            <button 
              type="button"
              className="flex-shrink-0 w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors sm:hidden"
            >
              <Plus size={20} />
            </button>

            {/* Zone de texte */}
            <div className="flex-1 relative">
              <div className="border border-gray-300 rounded-full bg-gray-50 focus-within:bg-white focus-within:border-gray-400 transition-all">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tapez un message..."
                  className="w-full bg-transparent px-4 py-3 sm:py-2.5 rounded-full focus:outline-none text-sm sm:text-base placeholder:text-gray-500"
                  disabled={sending}
                />
              </div>
            </div>

            {/* Bouton d'envoi */}
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className={`flex-shrink-0 w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                message.trim() && !sending
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send size={16} className={message.trim() ? "text-white" : "text-gray-400"} />
              )}
            </button>
          </div>
        </form>

        {/* Suggestions rapides (style Airbnb) - optionnel */}
        <div className="mt-3 flex space-x-2 overflow-x-auto scrollbar-hide sm:hidden">
          <button 
            type="button"
            onClick={() => setMessage("Bonjour !")}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            👋 Bonjour !
          </button>
          <button 
            type="button"
            onClick={() => setMessage("Je suis intéressé(e)")}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            ✨ Je suis intéressé(e)
          </button>
          <button 
            type="button"
            onClick={() => setMessage("Merci !")}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
          >
            🙏 Merci !
          </button>
        </div>
      </div>

      {/* Zone de sécurité pour les appareils avec encoche */}
      <div className="h-safe-area-inset-bottom bg-white sm:hidden" />
    </div>
  );
}