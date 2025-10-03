import { GameMode } from './game.types';

export const DEAL_PATTERNS: Record<GameMode, number[]> = {
    [GameMode.TWO_PLAYER]: [5, 4, 4, 5, 4, 4], // 26 cards each
    [GameMode.THREE_PLAYER]: [5, 4, 4, 4], // 17 cards each (51-card deck)
    [GameMode.FOUR_PLAYER]: [5, 4, 4], // 13 cards each
};

export const TRICKS_TO_WIN: Record<GameMode, number> = {
    [GameMode.TWO_PLAYER]: 13,
    [GameMode.THREE_PLAYER]: 7,
    [GameMode.FOUR_PLAYER]: 7,
};

export const DEFAULT_TURN_TIMER = 15; // seconds
export const DEFAULT_KOT_BONUS = 1; // extra hand for 7-0
export const DEFAULT_TARGET_HANDS = 3; // Best-of-3

export const TIMER_TICK_INTERVAL = 1000; // milliseconds

// For 3-player mode, remove diamonds 2
export const REMOVED_CARD_3P = { suit: 'diamonds' as const, rank: '2' as const };

// WebSocket events
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