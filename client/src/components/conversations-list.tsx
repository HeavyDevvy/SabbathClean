import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MessageCircle } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useState } from "react";

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

interface ConversationsListProps {
  currentUserId: string;
  currentUserType: "customer" | "provider";
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
}

export default function ConversationsList({
  currentUserId,
  currentUserType,
  selectedConversationId,
  onSelectConversation
}: ConversationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return currentUserType === "customer" ? conversation.provider : conversation.customer;
  };

  const getUnreadCount = (conversation: Conversation) => {
    return currentUserType === "customer" 
      ? conversation.unreadCountCustomer 
      : conversation.unreadCountProvider;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    const participant = getOtherParticipant(conversation);
    const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-conversations"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-lg text-gray-600 mb-2">No conversations yet</h3>
            <p className="text-sm text-gray-400">
              {searchQuery 
                ? "No conversations match your search"
                : "Start a conversation with a service provider"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const participant = getOtherParticipant(conversation);
              const unreadCount = getUnreadCount(conversation);
              const isSelected = conversation.id === selectedConversationId;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                  data-testid={`conversation-item-${conversation.id}`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={participant.profileImage} alt={`${participant.firstName} ${participant.lastName}`} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(participant.firstName, participant.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold text-sm truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {participant.firstName} {participant.lastName}
                      </h4>
                      <span className="text-xs text-gray-400 ml-2">
                        {conversation.lastMessageAt && formatTimestamp(conversation.lastMessageAt)}
                      </span>
                    </div>
                    
                    {conversation.booking && (
                      <p className="text-xs text-blue-600 mb-1">
                        {conversation.booking.serviceType} - #{conversation.booking.bookingNumber}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate flex-1 ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white min-w-[20px] h-5 flex items-center justify-center rounded-full">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
