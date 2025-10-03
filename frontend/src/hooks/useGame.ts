import { useState, useEffect, useCallback } from 'react';
import { GameState, Suit, Card } from '../types/game.types';
import { socketService, WS_EVENTS } from '../services/socket.service';

export const useGame = (roomId: string, playerId: string) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!roomId || !playerId) return;

        // Join game
        socketService.joinGame(roomId, playerId);

        // Listen for game events
        const handleStateSync = (state: GameState) => {
            setGameState(state);
            setIsLoading(false);
        };

        const handleTrumpSelected = (data: { suit: Suit; selectedBy: string }) => {
            setGameState(prev => {
                if (!prev || !prev.currentHand) return prev;
                return {
                    ...prev,
                    currentHand: {
                        ...prev.currentHand,
                        trumpSuit: data.suit,
                        trumpSelectedBy: data.selectedBy,
                    },
                };
            });
        };

        const handleCardPlayed = (data: any) => {
            // Card played event handled by state sync
        };

        const handleTrickComplete = (data: any) => {
            // Trick complete event
        };

        const handleHandComplete = (data: any) => {
            // Hand complete event
        };

        const handleTimerTick = (data: { playerId: string; timeRemaining: number }) => {
            setGameState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    players: prev.players.map(p =>
                        p.id === data.playerId ? { ...p, timeRemaining: data.timeRemaining } : p
                    ),
                };
            });
        };

        const handlePlayerTimeout = (data: { playerId: string; message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 3000);
        };

        const handleInvalidMove = (data: { message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 3000);
        };

        socketService.on(WS_EVENTS.STATE_SYNC, handleStateSync);
        socketService.on(WS_EVENTS.TRUMP_SELECTED, handleTrumpSelected);
        socketService.on(WS_EVENTS.CARD_PLAYED, handleCardPlayed);
        socketService.on(WS_EVENTS.TRICK_COMPLETE, handleTrickComplete);
        socketService.on(WS_EVENTS.HAND_COMPLETE, handleHandComplete);
        socketService.on(WS_EVENTS.TIMER_TICK, handleTimerTick);
        socketService.on(WS_EVENTS.PLAYER_TIMEOUT, handlePlayerTimeout);
        socketService.on(WS_EVENTS.INVALID_MOVE, handleInvalidMove);

        return () => {
            socketService.off(WS_EVENTS.STATE_SYNC, handleStateSync);
            socketService.off(WS_EVENTS.TRUMP_SELECTED, handleTrumpSelected);
            socketService.off(WS_EVENTS.CARD_PLAYED, handleCardPlayed);
            socketService.off(WS_EVENTS.TRICK_COMPLETE, handleTrickComplete);
            socketService.off(WS_EVENTS.HAND_COMPLETE, handleHandComplete);
            socketService.off(WS_EVENTS.TIMER_TICK, handleTimerTick);
            socketService.off(WS_EVENTS.PLAYER_TIMEOUT, handlePlayerTimeout);
            socketService.off(WS_EVENTS.INVALID_MOVE, handleInvalidMove);
        };
    }, [roomId, playerId]);

    const selectTrump = useCallback((suit: Suit) => {
        socketService.selectTrump(roomId, playerId, suit);
    }, [roomId, playerId]);

    const playCard = useCallback((card: Card) => {
        socketService.playCard(roomId, playerId, card.id);
    }, [roomId, playerId]);

    const currentPlayer = gameState?.players.find(p => p.id === playerId);
    const isMyTurn = currentPlayer?.isCurrentTurn || false;
    const myHand = currentPlayer?.hand || [];

    return {
        gameState,
        currentPlayer,
        myHand,
        isMyTurn,
        isLoading,
        error,
        selectTrump,
        playCard,
    };
};