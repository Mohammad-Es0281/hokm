import { Injectable } from '@nestjs/common';
import { GameState, GamePhase, PlayerState, HandState, TrickState } from './types/game.types';
import { Card, Suit } from './types/card.types';

@Injectable()
export class GameStateManager {
    private gameStates: Map<string, GameState> = new Map();

    /**
     * Initialize a new game state
     */
    initializeState(roomId: string, state: GameState): void {
        this.gameStates.set(roomId, state);
    }

    /**
     * Get game state
     */
    getState(roomId: string): GameState | undefined {
        return this.gameStates.get(roomId);
    }

    /**
     * Update game state
     */
    updateState(roomId: string, updates: Partial<GameState>): void {
        const state = this.gameStates.get(roomId);
        if (state) {
            Object.assign(state, updates);
        }
    }

    /**
     * Delete game state
     */
    deleteState(roomId: string): void {
        this.gameStates.delete(roomId);
    }

    /**
     * Update player state
     */
    updatePlayer(roomId: string, playerId: string, updates: Partial<PlayerState>): void {
        const state = this.gameStates.get(roomId);
        if (state) {
            const player = state.players.find(p => p.id === playerId);
            if (player) {
                Object.assign(player, updates);
            }
        }
    }

    /**
     * Add card to player hand
     */
    addCardsToHand(roomId: string, playerId: string, cards: Card[]): void {
        const state = this.gameStates.get(roomId);
        if (state) {
            const player = state.players.find(p => p.id === playerId);
            if (player) {
                player.hand.push(...cards);
            }
        }
    }

    /**
     * Remove card from player hand
     */
    removeCardFromHand(roomId: string, playerId: string, cardId: string): Card | null {
        const state = this.gameStates.get(roomId);
        if (state) {
            const player = state.players.find(p => p.id === playerId);
            if (player) {
                const cardIndex = player.hand.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                    return player.hand.splice(cardIndex, 1)[0];
                }
            }
        }
        return null;
    }

    /**
     * Set trump suit
     */
    setTrumpSuit(roomId: string, suit: Suit, selectedBy: string): void {
        const state = this.gameStates.get(roomId);
        if (state && state.currentHand) {
            state.currentHand.trumpSuit = suit;
            state.currentHand.trumpSelectedBy = selectedBy;
            state.phase = GamePhase.PLAYING;
        }
    }

    /**
     * Get current turn player
     */
    getCurrentTurnPlayer(roomId: string): PlayerState | null {
        const state = this.gameStates.get(roomId);
        if (state) {
            return state.players.find(p => p.isCurrentTurn) || null;
        }
        return null;
    }

    /**
     * Set current turn
     */
    setCurrentTurn(roomId: string, playerId: string): void {
        const state = this.gameStates.get(roomId);
        if (state) {
            state.players.forEach(p => {
                p.isCurrentTurn = p.id === playerId;
            });
        }
    }

    /**
     * Initialize new hand
     */
    initializeHand(roomId: string, handState: HandState): void {
        const state = this.gameStates.get(roomId);
        if (state) {
            state.currentHand = handState;
            state.phase = GamePhase.TRUMP_SELECTION;
        }
    }

    /**
     * Initialize new trick
     */
    initializeNewTrick(roomId: string, trickNumber: number, leadPlayerId: string): void {
        const state = this.gameStates.get(roomId);
        if (state && state.currentHand) {
            state.currentHand.currentTrick = {
                trickNumber,
                leadSuit: null,
                playedCards: [],
                winnerId: null,
            };
            this.setCurrentTurn(roomId, leadPlayerId);
        }
    }

    /**
     * Complete current trick
     */
    completeTrick(roomId: string, winnerId: string): void {
        const state = this.gameStates.get(roomId);
        if (state && state.currentHand) {
            const trick = state.currentHand.currentTrick;
            trick.winnerId = winnerId;

            // Add to tricks history
            state.currentHand.tricks.push({ ...trick });

            // Update scores
            if (!state.currentHand.scores[winnerId]) {
                state.currentHand.scores[winnerId] = 0;
            }
            state.currentHand.scores[winnerId]++;

            // Update player tricks won
            const player = state.players.find(p => p.id === winnerId);
            if (player) {
                player.tricksWon++;
            }
        }
    }

    /**
     * Get sanitized state for a specific player
     */
    getSanitizedStateForPlayer(roomId: string, playerId: string): GameState | null {
        const state = this.gameStates.get(roomId);
        if (!state) return null;

        // Create a deep copy
        const sanitized: GameState = JSON.parse(JSON.stringify(state));

        // Hide other players' hands
        sanitized.players = sanitized.players.map(player => {
            if (player.id !== playerId) {
                return {
                    ...player,
                    hand: player.hand.map(() => ({
                        suit: 'hidden' as any,
                        rank: 'hidden' as any,
                        id: 'hidden'
                    })),
                };
            }
            return player;
        });

        return sanitized;
    }

    /**
     * Check if all states are initialized
     */
    hasState(roomId: string): boolean {
        return this.gameStates.has(roomId);
    }
}