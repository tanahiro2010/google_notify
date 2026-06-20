import type { ChatSpace } from "../types/chat";
import { useState, useEffect } from 'react';
import { GoogleAPIClient } from '../lib/google';

const useChat = () => {
  const [chatMessages, setChatMessages] = useState<ChatSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      setError(new Error("アクセストークンが見つかりません"));
      return;
    }

    const fetchChatMessages = async () => {
      const client = new GoogleAPIClient(token);
      try {
        const spaces = await client.fetchChatSpaces();
        // Here you would typically fetch messages for each space
        // For now, we'll just set the spaces as the chat messages
        setChatMessages(spaces);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, []);

  return { chatMessages, loading, error } as const;
}

export { useChat };