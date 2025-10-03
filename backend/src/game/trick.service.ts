import { Injectable } from '@nestjs/common';
import { Card, Suit, PlayedCard, RANK_VALUES } from './types/card.types';
import { AutoPlayPolicy } from './types/game.types';

@Injectable()
export class TrickService {
    /**
     * Validate if a card play is legal
     */
    validatePlay(
        card: Card,
        playerHand: Card[],
        leadSuit: Suit | null,
        trumpSuit: Suit | null
    ): { valid: boolean; reason?: string } {
        // Check if player has the card
        if (!playerHand.find(c => c.id === card.id)) {
            return { valid: false, reason: 'کارت در دست شما نیست' };
        }

        // If no lead suit yet (first card), any card is valid
        if (!leadSuit) {
            return { valid: true };
        }

        // Check if player must follow suit
        const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);

        if (hasLeadSuit && card.suit !== leadSuit) {
            return {
                valid: false,
                reason: 'باید از خال حکم پیروی کنید'
            };
        }

        return { valid: true };
    }

    /**
     * Determine the winner of a trick
     */
    determineTrickWinner(
        playedCards: PlayedCard[],
        leadSuit: Suit,
        trumpSuit: Suit | null
    ): string {
        if (playedCards.length === 0) {
            throw new Error('No cards played');
        }

        // Check if any trump cards were played
        const trumpCards = playedCards.filter(c => c.suit === trumpSuit);

        if (trumpCards.length > 0) {
            // Highest trump wins
            return this.findHighestCard(trumpCards).playerId;
        }

        // No trump played, highest lead suit wins
        const leadSuitCards = playedCards.filter(c => c.suit === leadSuit);
        return this.findHighestCard(leadSuitCards).playerId;
    }

    /**
     * Find the highest ranking card
     */
    private findHighestCard(cards: PlayedCard[]): PlayedCard {
        return cards.reduce((highest, current) => {
            return RANK_VALUES[current.rank] > RANK_VALUES[highest.rank]
                ? current
                : highest;
        });
    }

    /**
     * Auto-play policy: deterministic card selection on timeout
     */
    selectAutoPlayCard(
        playerHand: Card[],
        leadSuit: Suit | null,
        trumpSuit: Suit | null
    ): AutoPlayPolicy {
        const hasLeadSuit = leadSuit
            ? playerHand.some(c => c.suit === leadSuit)
            : false;

        // 1. If player has lead suit, play lowest rank of that suit
        if (hasLeadSuit && leadSuit) {
            const leadSuitCards = playerHand.filter(c => c.suit === leadSuit);
            const lowestCard = this.findLowestCard(leadSuitCards);

            return {
                hasLeadSuit: true,
                hasNonTrump: false,
                selectedCard: lowestCard,
                reason: 'پایین‌ترین کارت خال حکم',
            };
        }

        // 2. If no lead suit, play lowest non-trump card
        const nonTrumpCards = playerHand.filter(c => c.suit !== trumpSuit);

        if (nonTrumpCards.length > 0) {
            const lowestCard = this.findLowestCard(nonTrumpCards);

            return {
                hasLeadSuit: false,
                hasNonTrump: true,
                selectedCard: lowestCard,
                reason: 'پایین‌ترین کارت غیر حکمی',
            };
        }

        // 3. Only trump cards left, play lowest trump
        const lowestCard = this.findLowestCard(playerHand);

        return {
            hasLeadSuit: false,
            hasNonTrump: false,
            selectedCard: lowestCard,
            reason: 'پایین‌ترین کارت حکمی',
        };
    }

    /**
     * Find the lowest ranking card
     */
    private findLowestCard(cards: Card[]): Card {
        return cards.reduce((lowest, current) => {
            return RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank]
                ? current
                : lowest;
        });
    }

    /**
     * Check if a player has revoked (failed to follow suit when able)
     */
    checkRevoke(
        playedCard: Card,
        playerHand: Card[],
        leadSuit: Suit | null
    ): boolean {
        if (!leadSuit || playedCard.suit === leadSuit) {
            return false;
        }

        // Check if player had the lead suit
        const hadLeadSuit = [...playerHand, playedCard].some(c => c.suit === leadSuit);

        return hadLeadSuit;
    }
}