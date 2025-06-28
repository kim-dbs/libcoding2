import axios from 'axios';
import { User, MatchRequest, LoginRequest, SignupRequest, ProfileUpdateRequest, Message, MessageCreate, Conversation } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터로 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 인증 API
export const authAPI = {
  login: async (data: LoginRequest): Promise<string> => {
    const response = await api.post('/login', data);
    return response.data.token;
  },

  signup: async (data: SignupRequest): Promise<void> => {
    await api.post('/signup', data);
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/me');
    return response.data;
  },
};

// 프로필 API
export const profileAPI = {
  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await api.put('/profile', data);
    return response.data;
  },
};

// 멘토 API
export const mentorAPI = {
  getMentors: async (skill?: string, orderBy?: string): Promise<User[]> => {
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (orderBy) params.append('order_by', orderBy);
    
    const response = await api.get(`/mentors?${params.toString()}`);
    return response.data;
  },
};

// 매칭 요청 API
export const matchRequestAPI = {
  createRequest: async (mentorId: number, message: string): Promise<MatchRequest> => {
    const response = await api.post('/match-requests', {
      mentorId,
      message,
    });
    return response.data;
  },

  getIncomingRequests: async (): Promise<MatchRequest[]> => {
    const response = await api.get('/match-requests/incoming');
    return response.data;
  },

  getOutgoingRequests: async (): Promise<MatchRequest[]> => {
    const response = await api.get('/match-requests/outgoing');
    return response.data;
  },

  acceptRequest: async (requestId: number): Promise<MatchRequest> => {
    const response = await api.put(`/match-requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId: number): Promise<MatchRequest> => {
    const response = await api.put(`/match-requests/${requestId}/reject`);
    return response.data;
  },

  cancelRequest: async (requestId: number): Promise<MatchRequest> => {
    const response = await api.delete(`/match-requests/${requestId}`);
    return response.data;
  },
};

// 메시지 API
export const messageAPI = {
  sendMessage: async (messageData: MessageCreate): Promise<Message> => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  getMessagesWithUser: async (userId: number): Promise<Message[]> => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/conversations');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },
};

export default api;
