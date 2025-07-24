"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ConversationsList from "@/app/components/messaging/ConversationsList";
import MessagesList from "@/app/components/messaging/MessagesList";
import MessageInput from "@/app/components/messaging/MessageInput";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { ArrowLeft } from "lucide-react";

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { user, loading } = useCurrentUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Si on a un paramètre conversation dans l'URL
    const conversationParam = searchParams?.get("conversation");
    if (conversationParam) {
      setSelectedConversationId(conversationParam);
    }
  }, [searchParams]);

  const handleBackToList = () => {
    setSelectedConversationId(null);
    window.history.pushState({}, '', '/messages');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <p className="text-gray-500">Vous devez être connecté pour voir vos messages.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Version Mobile */}
      <div className="md:hidden">
        {selectedConversationId ? (
          // Interface de chat mobile
          <div className="h-screen bg-white flex flex-col">
            {/* Header mobile */}
            <div className="flex items-center p-4 border-b bg-white sticky top-0 z-10">
              <button onClick={handleBackToList} className="mr-3">
                <ArrowLeft size={24} className="text-gray-700" />
              </button>
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>

            {/* Messages */}
            <MessagesList 
              conversationId={selectedConversationId} 
              currentUserId={user.id} 
            />
            
            {/* Input */}
            <MessageInput conversationId={selectedConversationId} />
          </div>
        ) : (
          // Liste des conversations mobile
          <div className="h-screen bg-white">
            {/* Header mobile */}
            <div className="sticky top-0 bg-white z-10 px-4 pt-12 pb-4">
              <h1 className="text-3xl font-semibold text-gray-900">Messages</h1>
            </div>

            {/* Liste des conversations */}
            <div className="px-4">
              <ConversationsList
                onSelectConversation={setSelectedConversationId}
                selectedConversationId={selectedConversationId || undefined}
                currentUserId={user.id}
              />
            </div>

            {/* Espace pour la navigation bottom */}
            <div className="h-20"></div>
          </div>
        )}
      </div>

      {/* Version Desktop (votre interface existante) */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
           
            <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Liste des conversations */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <ConversationsList
                  onSelectConversation={setSelectedConversationId}
                  selectedConversationId={selectedConversationId || undefined}
                  currentUserId={user.id}
                />
              </div>

              {/* Interface de chat */}
              <div className="flex-1 flex flex-col">
                {selectedConversationId ? (
                  <>
                    <MessagesList
                      conversationId={selectedConversationId}
                      currentUserId={user.id}
                    />
                    <MessageInput conversationId={selectedConversationId} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Sélectionnez une conversation pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}