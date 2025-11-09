import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ConversationsList from "@/components/conversations-list";
import ChatInterface from "@/components/chat-interface";
import { Card } from "@/components/ui/card";
import { MessageCircle, Loader2 } from "lucide-react";
import Header from "@/components/header";
import { authClient } from "@/lib/auth-client";
import { useLocation } from "wouter";

interface Conversation {
  id: string;
  customerId: string;
  providerId: string;
  bookingId?: string;
  lastMessageAt: string;
  lastMessage?: string;
  unreadCountCustomer: number;
  unreadCountProvider: number;
  status: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  provider: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  booking?: {
    id: string;
    bookingNumber: string;
    serviceType: string;
  };
}

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        return await authClient.getCurrentUser();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const currentUser = {
    id: user.id,
    type: (user.isProvider ? "provider" : "customer") as "customer" | "provider",
    firstName: user.firstName,
    lastName: user.lastName
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return currentUser.type === "customer" ? conversation.provider : conversation.customer;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <ConversationsList
              currentUserId={currentUser.id}
              currentUserType={currentUser.type}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="h-full">
                <ChatInterface
                  conversationId={selectedConversation.id}
                  currentUserId={currentUser.id}
                  currentUserType={currentUser.type}
                  otherParticipant={getOtherParticipant(selectedConversation)}
                />
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No conversation selected</h3>
                  <p className="text-sm text-gray-400">
                    Select a conversation from the list to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
