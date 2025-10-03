import { GameMode } from './game.types';

export enum RoomStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export interface Room {
    id: string;
    mode: GameMode;
    status: RoomStatus;
    turnTimer: number;
    kotBonus: number;
    targetHands: number;
    isPrivate: boolean;
    inviteCode?: string;
    createdBy: string;
    currentPlayerCount: number;
    isFull: boolean;
    players: RoomPlayer[];
}

export interface RoomPlayer {
    id: string;
    userId: string;
    position: number;
    team?: number;
    status: string;
    user: {
        telegramId: string;
        firstName: string;
        lastName?: string;
        photoUrl?: string;
    };
}

export interface CreateRoomData {
    userId: string;
    mode: GameMode;
    turnTimer?: number;
    kotBonus?: number;
    targetHands?: number;
    isPrivate?: boolean;
}