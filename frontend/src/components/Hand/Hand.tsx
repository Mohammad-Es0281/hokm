import React, { useState } from 'react';
import { Card as CardComponent } from '../Card/Card';
import { Card, Suit } from '../../types/game.types';
import { sortHand, canPlayCard } from '../../utils/card.utils';
import './Hand.css';

interface HandProps {
    cards: Card[];
    trumpSuit: Suit | null;
    leadSuit: Suit | null;
    isMyTurn: boolean;
    onCardClick: (card: Card) => void;
}

export const Hand: React.FC<HandProps> = ({
                                              cards,
                                              trumpSuit,
                                              leadSuit,
                                              isMyTurn,
                                              onCardClick,
                                          }) => {
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    const sortedCards = sortHand(cards, trumpSuit);

    const handleCardClick = (card: Card) => {
        if (!isMyTurn) return;

        const playable = canPlayCard(card, cards, leadSuit);
        if (!playable) return;

        setSelectedCard(card.id);
        onCardClick(card);
    };

    return (
        <div className="hand">
            <div className="hand-cards">
                {sortedCards.map((card, index) => {
                    const playable = isMyTurn && canPlayCard(card, cards, leadSuit);
                    const isSelected = selectedCard === card.id;

                    return (
                        <div
                            key={card.id}
                            className="hand-card"
                            style={{
                                zIndex: index,
                                transform: `translateX(${index * -20}px)`,
                            }}
                        >
                            <CardComponent
                                card={card}
                                onClick={() => handleCardClick(card)}
                                disabled={!playable}
                                selected={isSelected}
                                size="medium"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};