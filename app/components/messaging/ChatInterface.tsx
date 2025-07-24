// ========================
// 8. components/messaging/ConversationsList.tsx
// ========================

"use client";

import { useConversations } from "@/app/hooks/useConversations";
import { ConversationType } from "@/app/types/messaging";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
  currentUserId: string;
}

export default function ConversationsList({ 
  onSelectConversation, 
  selectedConversationId,
  currentUserId 
}: ConversationsListProps) {
  const { conversations, loading } = useConversations();

  const getOtherUser = (conversation: ConversationType) => {
    return conversation.user1.id === currentUserId
      ? conversation.user2
      : conversation.user1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherUser = getOtherUser(conversation);
        const isSelected = conversation.id === selectedConversationId;
        const unreadCount = conversation._count.messages;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {otherUser.image ? (
                  <Image
                    src={otherUser.image}
                    alt={otherUser.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {otherUser.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {otherUser.name}
                  </h3>
                  
                  {unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {conversation.lastMessageText && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessageText}
                  </p>
                )}

                {conversation.lastMessageAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(conversation.lastMessageAt), "dd/MM/yyyy HH:mm", {
                      locale: fr,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
