export enum Suit {
    HEARTS = 'hearts',
    DIAMONDS = 'diamonds',
    CLUBS = 'clubs',
    SPADES = 'spades',
}

export enum Rank {
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K',
    ACE = 'A',
}

export interface Card {
    suit: Suit;
    rank: Rank;
    id: string;
}

export interface PlayedCard extends Card {
    playerId: string;
    playerName: string;
    timestamp: Date;
}

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
    team?: number;
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
    dealPattern: number[];
    currentDealRound: number;
    tricks: TrickState[];
    currentTrick: TrickState;
    scores: Record<string, number>;
}

export interface GameSettings {
    mode: GameMode;
    turnTimer: number;
    kotBonus: number;
    targetHands: number;
    isPrivate: boolean;
    inviteCode?: string;
}

export interface GameState {
    roomId: string;
    mode: GameMode;
    phase: GamePhase;
    players: PlayerState[];
    currentHand: HandState | null;
    matchScore: Record<string, number>;
    targetHands: number;
    settings: GameSettings;
    deckHash: string;
    deckCommitment: string;
}