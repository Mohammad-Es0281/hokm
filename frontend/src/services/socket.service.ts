import { io, Socket } from 'socket.io-client';
import { GameState, Suit } from '../types/game.types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    connect(): void {
        if (this.socket?.connected) return;

        this.socket = io(WS_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Room events
    joinRoom(roomId: string, userId: string): void {
        this.socket?.emit('room:join', { roomId, userId });
    }

    leaveRoom(roomId: string, userId: string): void {
        this.socket?.emit('room:leave', { roomId, userId });
    }

    // Game events
    joinGame(roomId: string, playerId: string): void {
        this.socket?.emit('game:join', { roomId, playerId });
    }

    selectTrump(roomId: string, playerId: string, suit: Suit): void {
        this.socket?.emit('trump:select', { roomId, playerId, suit });
    }

    playCard(roomId: string, playerId: string, cardId: string): void {
        this.socket?.emit('card:play', { roomId, playerId, cardId });
    }

    // Event listeners
    on(event: string, callback: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
        this.socket?.on(event, callback as any);
    }

    off(event: string, callback: Function): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
            this.socket?.off(event, callback as any);
        }
    }

    removeAllListeners(): void {
        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket?.off(event, callback as any);
            });
        });
        this.listeners.clear();
    }
}

export const socketService = new SocketService();

// WebSocket event constants
export const WS_EVENTS = {
    // Room events
    ROOM_CREATED: 'room:created',
    ROOM_JOINED: 'room:joined',
    ROOM_LEFT: 'room:left',
    ROOM_UPDATED: 'room:updated',
    ROOM_FULL: 'room:full',

    // Game events
    GAME_STARTED: 'game:started',
    CARDS_DEALT: 'cards:dealt',
    TRUMP_SELECTION: 'trump:selection',
    TRUMP_SELECTED: 'trump:selected',
    TURN_CHANGED: 'turn:changed',
    CARD_PLAYED: 'card:played',
    TRICK_COMPLETE: 'trick:complete',
    HAND_COMPLETE: 'hand:complete',
    MATCH_COMPLETE: 'match:complete',

    // Timer events
    TIMER_TICK: 'timer:tick',
    PLAYER_TIMEOUT: 'player:timeout',
    PLAYER_AUTOPLAY: 'player:autoPlay',

    // Error events
    INVALID_MOVE: 'error:invalidMove',
    REVOKE_DETECTED: 'error:revoke',

    // State sync
    STATE_SYNC: 'state:sync',
};