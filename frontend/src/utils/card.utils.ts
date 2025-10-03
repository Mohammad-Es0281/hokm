import { Card, Suit, Rank } from '../types/game.types';

export const getSuitColor = (suit: Suit): string => {
    switch (suit) {
        case Suit.HEARTS:
        case Suit.DIAMONDS:
            return '#dc2626';
        case Suit.SPADES:
        case Suit.CLUBS:
            return '#000000';
        default:
            return '#000000';
    }
};

export const getSuitSymbol = (suit: Suit): string => {
    switch (suit) {
        case Suit.HEARTS:
            return '♥';
        case Suit.DIAMONDS:
            return '♦';
        case Suit.SPADES:
            return '♠';
        case Suit.CLUBS:
            return '♣';
        default:
            return '';
    }
};

export const sortHand = (cards: Card[], trumpSuit: Suit | null): Card[] => {
    const suitOrder = trumpSuit
        ? [trumpSuit, Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]
        : [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

    const rankValues: Record<Rank, number> = {
        [Rank.ACE]: 14,
        [Rank.KING]: 13,
        [Rank.QUEEN]: 12,
        [Rank.JACK]: 11,
        [Rank.TEN]: 10,
        [Rank.NINE]: 9,
        [Rank.EIGHT]: 8,
        [Rank.SEVEN]: 7,
        [Rank.SIX]: 6,
        [Rank.FIVE]: 5,
        [Rank.FOUR]: 4,
        [Rank.THREE]: 3,
        [Rank.TWO]: 2,
    };

    return [...cards].sort((a, b) => {
        const suitIndexA = suitOrder.indexOf(a.suit);
        const suitIndexB = suitOrder.indexOf(b.suit);

        if (suitIndexA !== suitIndexB) {
            return suitIndexA - suitIndexB;
        }

        return rankValues[b.rank] - rankValues[a.rank];
    });
};

export const canPlayCard = (
    card: Card,
    hand: Card[],
    leadSuit: Suit | null
): boolean => {
    if (!leadSuit) return true;

    const hasLeadSuit = hand.some(c => c.suit === leadSuit);

    if (hasLeadSuit && card.suit !== leadSuit) {
        return false;
    }

    return true;
};