import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { Card, Suit, Rank } from './types/card.types';
import { REMOVED_CARD_3P } from './types/constants';
import { GameMode } from './types/game.types';

@Injectable()
export class DeckService {
    /**
     * Create a standard 52-card deck
     */
    createFullDeck(): Card[] {
        const suits = Object.values(Suit);
        const ranks = Object.values(Rank);
        const deck: Card[] = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({
                    suit,
                    rank,
                    id: `${suit}_${rank}`,
                });
            }
        }

        return deck;
    }

    /**
     * Create deck based on game mode
     */
    createDeck(mode: GameMode): Card[] {
        const deck = this.createFullDeck();

        // For 3-player mode, remove diamonds 2
        if (mode === GameMode.THREE_PLAYER) {
            return deck.filter(
                card => !(card.suit === REMOVED_CARD_3P.suit && card.rank === REMOVED_CARD_3P.rank)
            );
        }

        return deck;
    }

    /**
     * Cryptographically secure shuffle using Fisher-Yates algorithm
     */
    shuffle(deck: Card[]): Card[] {
        const shuffled = [...deck];

        for (let i = shuffled.length - 1; i > 0; i--) {
            // Generate cryptographically secure random index
            const randomBytes = crypto.randomBytes(4);
            const randomValue = randomBytes.readUInt32BE(0);
            const j = randomValue % (i + 1);

            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Create commitment hash for deck verification
     */
    createDeckCommitment(deck: Card[]): { hash: string; salt: string } {
        const salt = crypto.randomBytes(32).toString('hex');
        const deckString = JSON.stringify(deck.map(c => c.id));
        const hash = crypto
            .createHash('sha256')
            .update(deckString + salt)
            .digest('hex');

        return { hash, salt };
    }

    /**
     * Verify deck commitment
     */
    verifyDeckCommitment(deck: Card[], hash: string, salt: string): boolean {
        const deckString = JSON.stringify(deck.map(c => c.id));
        const calculatedHash = crypto
            .createHash('sha256')
            .update(deckString + salt)
            .digest('hex');

        return calculatedHash === hash;
    }

    /**
     * Deal cards according to pattern
     */
    dealCards(
        deck: Card[],
        playerCount: number,
        pattern: number[]
    ): Record<string, Card[]>[] {
        const hands: Record<string, Card[]>[] = [];
        let deckIndex = 0;

        for (const cardsPerPlayer of pattern) {
            const round: Record<string, Card[]> = {};

            for (let player = 0; player < playerCount; player++) {
                const playerId = player.toString();
                if (!round[playerId]) {
                    round[playerId] = [];
                }

                for (let card = 0; card < cardsPerPlayer; card++) {
                    if (deckIndex < deck.length) {
                        round[playerId].push(deck[deckIndex++]);
                    }
                }
            }

            hands.push(round);
        }

        return hands;
    }

    /**
     * Combine dealt rounds into final hands
     */
    combineHands(
        dealtRounds: Record<string, Card[]>[],
        playerCount: number
    ): Record<string, Card[]> {
        const finalHands: Record<string, Card[]> = {};

        for (let player = 0; player < playerCount; player++) {
            const playerId = player.toString();
            finalHands[playerId] = [];

            for (const round of dealtRounds) {
                if (round[playerId]) {
                    finalHands[playerId].push(...round[playerId]);
                }
            }
        }

        return finalHands;
    }
}