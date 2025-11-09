import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Loader2, Phone, Video, MoreVertical } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { format } from "date-fns";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  currentUserType: "customer" | "provider";
  otherParticipant: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  onClose?: () => void;
}

export default function ChatInterface({
  conversationId,
  currentUserId,
  currentUserType,
  otherParticipant,
  onClose
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { lastMessage } = useChatWebSocket(currentUserId);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          senderType: currentUserType,
          content,
          messageType: "text"
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/conversations/${conversationId}/mark-read`, {
        method: "PATCH",
        body: JSON.stringify({ userType: currentUserType })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  useEffect(() => {
    markAsReadMutation.mutate();
  }, [conversationId]);

  useEffect(() => {
    if (lastMessage && lastMessage.conversationId === conversationId) {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      markAsReadMutation.mutate();
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.profileImage} alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`} />
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(otherParticipant.firstName, otherParticipant.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </CardTitle>
              <p className="text-xs text-gray-500">
                {currentUserType === "customer" ? "Service Provider" : "Customer"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-blue-600">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarImage src={otherParticipant.profileImage} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {getInitials(otherParticipant.firstName, otherParticipant.lastName)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">
                {otherParticipant.firstName} {otherParticipant.lastName}
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-2">No messages yet</p>
            <p className="text-gray-400 text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUserId;
              const showDate = index === 0 || 
                format(new Date(messages[index - 1].createdAt), 'yyyy-MM-dd') !== 
                format(new Date(msg.createdAt), 'yyyy-MM-dd');

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                      </Badge>
                    </div>
                  )}
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender.profileImage} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {getInitials(msg.sender.firstName, msg.sender.lastName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.content}</p>
                        </div>
                        <span className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <Separator />

      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
