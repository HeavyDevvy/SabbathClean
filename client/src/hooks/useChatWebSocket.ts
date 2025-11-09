import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  conversationId: string;
  message: any;
}

export function useChatWebSocket(userId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);

  useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Chat WebSocket connected');
        setIsConnected(true);
        
        ws.current?.send(JSON.stringify({
          type: 'subscribe_chat',
          userId
        }));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            setLastMessage(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('Chat WebSocket disconnected');
        setIsConnected(false);
      };

      ws.current.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }

    return () => {
      if (ws.current) {
        if (isConnected) {
          ws.current.send(JSON.stringify({
            type: 'unsubscribe_chat',
            userId
          }));
        }
        ws.current.close();
      }
    };
  }, [userId]);

  return { isConnected, lastMessage };
}
