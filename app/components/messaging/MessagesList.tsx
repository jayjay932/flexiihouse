
// ========================
// 9. components/messaging/MessagesList.tsx
// ========================

"use client";

import { useEffect, useRef } from "react";
import { useMessages } from "@/app/hooks/useMessages";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Image from "next/image";

interface MessagesListProps {
  conversationId: string;
  currentUserId: string;
}

export default function MessagesList({ conversationId, currentUserId }: MessagesListProps) {
  const { messages, loading } = useMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;

        return (
          <div key={message.id} className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
              {!isOwn && (
                <div className="flex-shrink-0">
                  {message.sender.image ? (
                    <Image
                      src={message.sender.image}
                      alt={message.sender.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {message.sender.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className={`px-4 py-2 rounded-lg ${
                isOwn 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-900"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isOwn ? "text-blue-100" : "text-gray-500"
                }`}>
                  {format(new Date(message.createdAt), "HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}