export interface User {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
  profile: {
    name: string;
    bio: string;
    imageUrl: string;
    skills?: string[];
  };
}

export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
}

export interface ProfileUpdateRequest {
  name: string;
  bio?: string;
  image?: string;
  skills?: string[];
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface MessageCreate {
  receiver_id: number;
  content: string;
}

export interface Conversation {
  user_id: number;
  user_name: string;
  user_role: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}
