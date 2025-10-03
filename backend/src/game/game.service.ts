import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { Hand } from './entities/hand.entity';
import { Trick } from './entities/trick.entity';
import { PlayedCard as PlayedCardEntity } from './entities/played-card.entity';
import { Room } from '../rooms/entities/room.entity';
import { GameStateManager } from './game-state.manager';
import { DeckService } from './deck.service';
import { TrickService } from './trick.service';
import { GameState, GamePhase, GameMode, PlayerState, HandState } from './types/game.types';
import { Card, Suit, PlayedCard } from './types/card.types';
import { DEAL_PATTERNS, TRICKS_TO_WIN } from './types/constants';

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Match)
        private matchRepository: Repository<Match>,
        @InjectRepository(Hand)
        private handRepository: Repository<Hand>,
        @InjectRepository(Trick)
        private trickRepository: Repository<Trick>,
        @InjectRepository(PlayedCardEntity)
        private playedCardRepository: Repository<PlayedCardEntity>,
        private gameStateManager: GameStateManager,
        private deckService: DeckService,
        private trickService: TrickService,
    ) {}

    /**
     * Start a new match
     */
    async startMatch(room: Room, playerIds: string[]): Promise<{ match: Match; state: GameState }> {
        // Create match entity
        const match = this.matchRepository.create({
            roomId: room.id,
            playerIds,
            matchScore: this.initializeMatchScore(room.mode, playerIds),
            targetHands: room.targetHands,
            teams: room.mode === GameMode.FOUR_PLAYER ? this.assignTeams(playerIds) : null,
            deckCommitment: '', // Will be set on first hand
        });

        await this.matchRepository.save(match);

        // Initialize game state
        const gameState = this.initializeGameState(room, match, playerIds);
        this.gameStateManager.initializeState(room.id, gameState);

        return { match, state: gameState };
    }

    /**
     * Initialize game state
     */
    private initializeGameState(room: Room, match: Match, playerIds: string[]): GameState {
        const players: PlayerState[] = playerIds.map((id, index) => ({
            id,
            name: `Player ${index + 1}`, // Will be updated with real names
            hand: [],
            tricksWon: 0,
            isLeader: false,
            isCurrentTurn: false,
            timeRemaining: room.turnTimer,
            connected: true,
            team: match.teams ? match.teams[id] : undefined,
        }));

        return {
            roomId: room.id,
            mode: room.mode,
            phase: GamePhase.WAITING,
            players,
            currentHand: null,
            matchScore: match.matchScore,
            targetHands: room.targetHands,
            settings: {
                mode: room.mode,
                turnTimer: room.turnTimer,
                kotBonus: room.kotBonus,
                targetHands: room.targetHands,
                isPrivate: room.isPrivate,
                inviteCode: room.inviteCode,
            },
            deckHash: '',
            deckCommitment: '',
        };
    }

    /**
     * Initialize match score
     */
    private initializeMatchScore(mode: GameMode, playerIds: string[]): Record<string, number> {
        const score: Record<string, number> = {};

        if (mode === GameMode.FOUR_PLAYER) {
            // Team scores
            score['team_0'] = 0;
            score['team_1'] = 0;
        } else {
            // Individual scores
            playerIds.forEach(id => {
                score[id] = 0;
            });
        }

        return score;
    }

    /**
     * Assign teams for 4-player mode
     */
    private assignTeams(playerIds: string[]): Record<string, number> {
        const teams: Record<string, number> = {};
        playerIds.forEach((id, index) => {
            teams[id] = index % 2; // Alternate teams: 0, 1, 0, 1
        });
        return teams;
    }

    /**
     * Start a new hand
     */
    async startHand(
        roomId: string,
        matchId: string,
        handNumber: number,
        leaderId: string
    ): Promise<Hand> {
        const state = this.gameStateManager.getState(roomId);
        if (!state) throw new Error('Game state not found');

        // Create and shuffle deck
        const deck = this.deckService.createDeck(state.mode);
        const shuffled = this.deckService.shuffle(deck);

        // Create commitment
        const { hash, salt } = this.deckService.createDeckCommitment(shuffled);

        // Get deal pattern
        const dealPattern = DEAL_PATTERNS[state.mode];

        // Deal first round (5 cards)
        const firstRound = this.deckService.dealCards(shuffled, state.players.length, [dealPattern[0]]);

        // Distribute first 5 cards to players
        state.players.forEach((player, index) => {
            const cards = firstRound[0][index.toString()];
            this.gameStateManager.addCardsToHand(roomId, player.id, cards);
        });

        // Set leader
        state.players.forEach(p => {
            p.isLeader = p.id === leaderId;
        });

        // Create hand entity
        const hand = this.handRepository.create({
            matchId,
            handNumber,
            trumpSelectedBy: leaderId,
            leaderId,
            dealPattern,
            initialHands: {}, // Will be filled after all cards dealt
            scores: this.initializeHandScore(state.mode, state.players.map(p => p.id)),
            deckHash: hash,
        });

        await this.handRepository.save(hand);

        // Initialize hand state
        const handState: HandState = {
            handNumber,
            trumpSuit: null,
            trumpSelectedBy: null,
            dealPattern,
            currentDealRound: 1,
            tricks: [],
            currentTrick: {
                trickNumber: 1,
                leadSuit: null,
                playedCards: [],
                winnerId: null,
            },
            scores: hand.scores,
        };

        this.gameStateManager.initializeHand(roomId, handState);
        this.gameStateManager.updateState(roomId, {
            phase: GamePhase.TRUMP_SELECTION,
            deckHash: hash,
        });

        return hand;
    }

    /**
     * Initialize hand score
     */
    private initializeHandScore(mode: GameMode, playerIds: string[]): Record<string, number> {
        const score: Record<string, number> = {};

        if (mode === GameMode.FOUR_PLAYER) {
            score['team_0'] = 0;
            score['team_1'] = 0;
        } else {
            playerIds.forEach(id => {
                score[id] = 0;
            });
        }

        return score;
    }

    /**
     * Select trump suit
     */
    async selectTrump(roomId: string, playerId: string, suit: Suit): Promise<void> {
        const state = this.gameStateManager.getState(roomId);
        if (!state || !state.currentHand) {
            throw new Error('Invalid game state');
        }

        const player = state.players.find(p => p.id === playerId);
        if (!player || !player.isLeader) {
            throw new Error('Only leader can select trump');
        }

        this.gameStateManager.setTrumpSuit(roomId, suit, playerId);

        // Deal remaining cards
        await this.dealRemainingCards(roomId);

        // Start first trick
        this.gameStateManager.initializeNewTrick(roomId, 1, playerId);
    }

    /**
     * Deal remaining cards after trump selection
     */
    private async dealRemainingCards(roomId: string): Promise<void> {
        const state = this.gameStateManager.getState(roomId);
        if (!state || !state.currentHand) return;

        // This is simplified - in production, store the shuffled deck
        // For now, deal remaining cards from a new shuffle
        const deck = this.deckService.createDeck(state.mode);
        const shuffled = this.deckService.shuffle(deck);

        const dealPattern = state.currentHand.dealPattern;
        const remainingPattern = dealPattern.slice(1); // Skip first round already dealt

        const remainingDeals = this.deckService.dealCards(
            shuffled.slice(state.players.length * dealPattern[0]),
            state.players.length,
            remainingPattern
        );

        // Distribute remaining cards
        remainingDeals.forEach(round => {
            state.players.forEach((player, index) => {
                const cards = round[index.toString()];
                if (cards) {
                    this.gameStateManager.addCardsToHand(roomId, player.id, cards);
                }
            });
        });
    }

    /**
     * Play a card
     */
    async playCard(
        roomId: string,
        playerId: string,
        cardId: string
    ): Promise<{ valid: boolean; reason?: string }> {
        const state = this.gameStateManager.getState(roomId);
        if (!state || !state.currentHand) {
            return { valid: false, reason: 'بازی آماده نیست' };
        }

        const player = state.players.find(p => p.id === playerId);
        if (!player || !player.isCurrentTurn) {
            return { valid: false, reason: 'نوبت شما نیست' };
        }

        const card = player.hand.find(c => c.id === cardId);
        if (!card) {
            return { valid: false, reason: 'کارت در دست شما نیست' };
        }

        // Validate the play
        const validation = this.trickService.validatePlay(
            card,
            player.hand,
            state.currentHand.currentTrick.leadSuit,
            state.currentHand.trumpSuit
        );

        if (!validation.valid) {
            return validation;
        }

        // Remove card from hand
        this.gameStateManager.removeCardFromHand(roomId, playerId, cardId);

        // Add to played cards
        const playedCard: PlayedCard = {
            ...card,
            playerId,
            playerName: player.name,
            timestamp: new Date(),
        };

        state.currentHand.currentTrick.playedCards.push(playedCard);

        // Set lead suit if first card
        if (state.currentHand.currentTrick.playedCards.length === 1) {
            state.currentHand.currentTrick.leadSuit = card.suit;
        }

        // Check if trick is complete
        if (state.currentHand.currentTrick.playedCards.length === state.players.length) {
            await this.completeTrick(roomId);
        } else {
            // Move to next player
            this.nextTurn(roomId);
        }

        return { valid: true };
    }

    /**
     * Complete current trick
     */
    private async completeTrick(roomId: string): Promise<void> {
        const state = this.gameStateManager.getState(roomId);
        if (!state || !state.currentHand) return;

        const trick = state.currentHand.currentTrick;

        // Determine winner
        const winnerId = this.trickService.determineTrickWinner(
            trick.playedCards,
            trick.leadSuit!,
            state.currentHand.trumpSuit
        );

        // Update state
        this.gameStateManager.completeTrick(roomId, winnerId);

        // Check if hand is complete
        const tricksNeeded = TRICKS_TO_WIN[state.mode];
        const winnerScore = state.currentHand.scores[this.getScoreKey(state, winnerId)];

        if (winnerScore >= tricksNeeded) {
            await this.completeHand(roomId, winnerId);
        } else {
            // Start next trick
            const nextTrickNumber = state.currentHand.tricks.length + 1;
            this.gameStateManager.initializeNewTrick(roomId, nextTrickNumber, winnerId);
        }
    }

    /**
     * Get score key (player ID or team ID)
     */
    private getScoreKey(state: GameState, playerId: string): string {
        if (state.mode === GameMode.FOUR_PLAYER) {
            const player = state.players.find(p => p.id === playerId);
            return `team_${player?.team}`;
        }
        return playerId;
    }

    /**
     * Complete hand
     */
    private async completeHand(roomId: string, winnerId: string): Promise<void> {
        const state = this.gameStateManager.getState(roomId);
        if (!state) return;

        const scoreKey = this.getScoreKey(state, winnerId);
        state.matchScore[scoreKey]++;

        state.phase = GamePhase.HAND_COMPLETE;

        // Check for match completion
        if (state.matchScore[scoreKey] >= state.targetHands) {
            state.phase = GamePhase.MATCH_COMPLETE;
        }
    }

    /**
     * Move to next turn
     */
    private nextTurn(roomId: string): void {
        const state = this.gameStateManager.getState(roomId);
        if (!state) return;

        const currentIndex = state.players.findIndex(p => p.isCurrentTurn);
        const nextIndex = (currentIndex + 1) % state.players.length;

        this.gameStateManager.setCurrentTurn(roomId, state.players[nextIndex].id);
    }

    /**
     * Get game state for a player
     */
    getGameState(roomId: string, playerId: string): GameState | null {
        return this.gameStateManager.getSanitizedStateForPlayer(roomId, playerId);
    }
}