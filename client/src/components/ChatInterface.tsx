import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  // Get or create conversation
  const { data: conversationData, error: conversationError } = useQuery({
    queryKey: ["/api/conversations", bookingId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        bookingId,
        customerId,
        providerId
      });
      return response.json() as Promise<Conversation>;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1
  });

  useEffect(() => {
    if (conversationData && !conversation) {
      setConversation(conversationData as Conversation);
    }
  }, [conversationData, conversation]);

  useEffect(() => {
    if (conversationError) {
      toast({
        title: "Connection Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive"
      });
    }
  }, [conversationError, toast]);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!conversation?.id) {
        console.error("❌ No conversation ID available");
        throw new Error("No conversation");
      }
      
      // Determine if sender is customer or provider
      const senderType = currentUserId === customerId ? "customer" : "provider";
      
      console.log("📤 Sending message:", { 
        conversationId: conversation.id, 
        senderId: currentUserId, 
        senderType,
        content: text 
      });
      
      const response = await apiRequest("POST", "/api/messages", {
        conversationId: conversation.id,
        senderId: currentUserId,
        senderType,
        content: text
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Send failed:", error);
        throw new Error(error);
      }
      
      const result = await response.json();
      console.log("✅ Message sent:", result);
      return result;
    },
    onSuccess: () => {
      console.log("✅ Message success - clearing input");
      setMessageText("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversation?.id, "messages"] 
      });
    },
    onError: (error) => {
      console.error("❌ Send error:", error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = () => {
    console.log("🔘 Send button clicked, message:", messageText);
    if (!messageText.trim()) {
      console.log("⚠️ Message is empty, not sending");
      return;
    }
    console.log("✅ Triggering mutation");
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
      <div className="flex items-center justify-center h-full py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-berry-primary" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-berry-light/10 to-white">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-berry-primary text-white">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {currentUserId === customerId ? providerName : customerName}
            </h3>
            <p className="text-xs text-gray-500">
              Booking #{bookingId.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-berry-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-xs">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">No messages yet</p>
              </div>
              <p className="text-xs text-gray-500">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm ${
                        isOwnMessage
                          ? 'bg-berry-primary text-black rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {message.content}
                      </p>
                      <p className={`text-[10px] mt-1 ${isOwnMessage ? 'text-black/60' : 'text-gray-400'}`}>
                        {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input - WhatsApp Style */}
      <div className="flex-shrink-0 border-t bg-white/95 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 rounded-full border-gray-300 focus:border-berry-primary focus:ring-berry-primary"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            className="rounded-full w-14 h-14 p-0 bg-white hover:bg-gray-50 border-2 border-berry-primary shadow-lg transition-all disabled:opacity-100 disabled:bg-gray-100 disabled:border-gray-300 flex items-center justify-center"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin text-berry-primary" />
            ) : (
              <Send className="h-7 w-7 text-berry-primary" strokeWidth={2.5} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
