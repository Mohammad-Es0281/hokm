import axios from 'axios';
import { Room, CreateRoomData } from '../types/room.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const apiService = {
    // Authentication
    async authenticateTelegram(initData: string) {
        const response = await api.post('/auth/telegram', { initData });
        return response.data;
    },

    // Rooms
    async getAvailableRooms(mode?: number): Promise<Room[]> {
        const params = mode ? { mode } : {};
        const response = await api.get('/rooms', { params });
        return response.data;
    },

    async getRoom(roomId: string): Promise<Room> {
        const response = await api.get(`/rooms/${roomId}`);
        return response.data;
    },

    async getRoomByInviteCode(code: string): Promise<Room> {
        const response = await api.get(`/rooms/invite/${code}`);
        return response.data;
    },

    async createRoom(data: CreateRoomData): Promise<Room> {
        const response = await api.post('/rooms', data);
        return response.data;
    },

    async joinRoom(roomId: string, userId: string) {
        const response = await api.post(`/rooms/${roomId}/join`, { userId });
        return response.data;
    },

    async leaveRoom(roomId: string, userId: string) {
        const response = await api.post(`/rooms/${roomId}/leave`, { userId });
        return response.data;
    },

    // Users
    async getUser(telegramId: string) {
        const response = await api.get(`/users/${telegramId}`);
        return response.data;
    },

    async getLeaderboard(limit: number = 100) {
        const response = await api.get('/users/leaderboard', { params: { limit } });
        return response.data;
    },

    // Replay
    async getMatchReplay(matchId: string) {
        const response = await api.get(`/replay/match/${matchId}`);
        return response.data;
    },

    async getHandReplay(handId: string) {
        const response = await api.get(`/replay/hand/${handId}`);
        return response.data;
    },

    async getPlayerMatchHistory(userId: string, limit: number = 20) {
        const response = await api.get(`/replay/player/${userId}`, { params: { limit } });
        return response.data;
    },
};