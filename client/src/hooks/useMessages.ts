import { useQuery } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => messageService.getConversations(),
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => messageService.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}
