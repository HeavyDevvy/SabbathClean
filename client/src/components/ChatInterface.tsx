import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message, Conversation } from "@shared/schema";

interface ChatInterfaceProps {
  bookingId: string;
  customerId: string;
  providerId: string;
  customerName: string;
  providerName: string;
  currentUserId: string;
}

export function ChatInterface({
  bookingId,
  customerId,
  providerId,
  customerName,
  providerName,
  currentUserId
}: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Get or create conversation (only once per booking)
  const { data: conversationData } = useQuery<Conversation>({
    queryKey: ["/api/conversations", bookingId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        bookingId,
        customerId,
        providerId
      });
      return response;
    },
    staleTime: Infinity, // Conversation won't change for this booking
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  useEffect(() => {
    if (conversationData && !conversation) {
      setConversation(conversationData);
    }
  }, [conversationData, conversation]);

  // Get messages for conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversation?.id, "messages"],
    queryFn: async () => {
      if (!conversation?.id) return [];
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!conversation?.id
  });

  // WebSocket connection for real-time messages
  useEffect(() => {
    if (!conversation?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("💬 Chat WebSocket connected");
      ws.send(JSON.stringify({
        type: 'subscribe_chat',
        conversationId: conversation.id
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message' && data.conversationId === conversation.id) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/conversations", conversation.id, "messages"] 
        });
      }
    };

    ws.onerror = (error) => {
      console.error("Chat WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("💬 Chat WebSocket disconnected");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [conversation?.id]);

  // Mark messages as read when viewing (only when new messages arrive)
  const lastMessageCountRef = useRef(0);
  useEffect(() => {
    if (!conversation?.id || !currentUserId || messages.length === 0) return;
    
    // Only mark as read if there are new messages
    if (messages.length > lastMessageCountRef.current) {
      const markAsRead = async () => {
        try {
          await apiRequest("POST", `/api/conversations/${conversation.id}/mark-read`, {
            userId: currentUserId
          });
          lastMessageCountRef.current = messages.length;
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      };

      markAsRead();
    }
  }, [conversation?.id, currentUserId, messages.length]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!conversation?.id) throw new Error("No conversation");
      
      return apiRequest("POST", "/api/messages", {
        conversationId: conversation.id,
        senderId: currentUserId,
        content: text
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversation?.id, "messages"] 
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-berry-primary" />
        <p className="text-sm text-muted-foreground">Loading conversation...</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="border-b p-4 bg-berry-light/30">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-berry-primary text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-berry-dark">
              {currentUserId === customerId ? providerName : customerName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Booking #{bookingId.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-berry-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-berry-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4 bg-berry-light/20">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="bg-berry-primary hover:bg-berry-dark text-white"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
