import React from 'react';
import { Card as CardComponent } from '../Card/Card';
import { PlayedCard } from '../../types/game.types';
import './Table.css';

interface TableProps {
    playedCards: PlayedCard[];
    playerCount: number;
}

export const Table: React.FC<TableProps> = ({ playedCards, playerCount }) => {
    const getCardPosition = (index: number) => {
        const angle = (360 / playerCount) * index - 90;
        const radius = 80;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return { x, y, rotation: angle + 90 };
    };

    return (
        <div className="table">
            <div className="table-cards">
                {playedCards.map((card, index) => {
                    const position = getCardPosition(index);

                    return (
                        <div
                            key={card.id}
                            className="table-card"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
                            }}
                        >
                            <CardComponent card={card} size="medium" />
                            <div className="table-card-player">{card.playerName}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};