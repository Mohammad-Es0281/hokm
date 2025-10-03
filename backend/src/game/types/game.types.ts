import { Card, Suit, PlayedCard } from './card.types';

export enum GameMode {
    TWO_PLAYER = 2,
    THREE_PLAYER = 3,
    FOUR_PLAYER = 4,
}

export enum GamePhase {
    WAITING = 'waiting',
    DEALING = 'dealing',
    TRUMP_SELECTION = 'trump_selection',
    PLAYING = 'playing',
    HAND_COMPLETE = 'hand_complete',
    MATCH_COMPLETE = 'match_complete',
}

export interface PlayerState {
    id: string;
    name: string;
    photoUrl?: string;
    hand: Card[];
    tricksWon: number;
    isLeader: boolean;
    isCurrentTurn: boolean;
    timeRemaining: number;
    connected: boolean;
    team?: number; // For 4-player mode (0 or 1)
}

export interface TrickState {
    trickNumber: number;
    leadSuit: Suit | null;
    playedCards: PlayedCard[];
    winnerId: string | null;
}

export interface HandState {
    handNumber: number;
    trumpSuit: Suit | null;
    trumpSelectedBy: string | null;
    dealPattern: number[]; // e.g., [5, 4, 4] for 4-player
    currentDealRound: number;
    tricks: TrickState[];
    currentTrick: TrickState;
    scores: Record<string, number>; // playerId or teamId -> tricks won
}

export interface GameState {
    roomId: string;
    mode: GameMode;
    phase: GamePhase;
    players: PlayerState[];
    currentHand: HandState | null;
    matchScore: Record<string, number>; // playerId or teamId -> hands won
    targetHands: number; // e.g., 3 for Best-of-3
    settings: GameSettings;
    deckHash: string; // For fairness verification
    deckCommitment: string;
}

export interface GameSettings {
    mode: GameMode;
    turnTimer: number; // seconds
    kotBonus: number; // extra hands for 7-0 victory
    targetHands: number; // Best-of-N
    isPrivate: boolean;
    inviteCode?: string;
}

export interface AutoPlayPolicy {
    hasLeadSuit: boolean;
    hasNonTrump: boolean;
    selectedCard: Card;
    reason: string;
}
