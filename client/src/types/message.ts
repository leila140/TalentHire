export interface Participant {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}
