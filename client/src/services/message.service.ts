import { api } from "./api";
import type { Conversation, ChatMessage } from "@/types/message";

export type { Participant, Conversation, ChatMessage } from "@/types/message";

export const messageService = {
  getConversations: async (): Promise<{ success: boolean; data: Conversation[] }> => {
    const { data } = await api.get("/messages/conversations");
    return data;
  },
  getOrCreateConversation: async (participantId: string): Promise<{ success: boolean; data: Conversation }> => {
    const { data } = await api.get(`/messages/conversations/${participantId}`);
    return data;
  },
  getMessages: async (conversationId: string): Promise<{ success: boolean; data: ChatMessage[] }> => {
    const { data } = await api.get(`/messages/conversations/${conversationId}/messages`);
    return data;
  },
};
