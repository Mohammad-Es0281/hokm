import React from 'react';
import { Card as CardType } from '../../types/game.types';
import { getSuitColor, getSuitSymbol } from '../../utils/card.utils';
import { getRankName } from '../../utils/i18n';
import './Card.css';

interface CardProps {
    card: CardType;
    onClick?: () => void;
    disabled?: boolean;
    selected?: boolean;
    size?: 'small' | 'medium' | 'large';
    faceDown?: boolean;
}

export const Card: React.FC<CardProps> = ({
                                              card,
                                              onClick,
                                              disabled = false,
                                              selected = false,
                                              size = 'medium',
                                              faceDown = false,
                                          }) => {
    const color = getSuitColor(card.suit);
    const symbol = getSuitSymbol(card.suit);
    const rankDisplay = getRankName(card.rank);

    if (faceDown) {
        return (
            <div className={`card card-${size} card-back`}>
                <div className="card-pattern" />
            </div>
        );
    }

    return (
        <div
            className={`card card-${size} ${selected ? 'card-selected' : ''} ${disabled ? 'card-disabled' : ''}`}
            onClick={!disabled ? onClick : undefined}
            style={{ color }}
        >
            <div className="card-corner top-left">
                <div className="card-rank">{rankDisplay}</div>
                <div className="card-suit">{symbol}</div>
            </div>

            <div className="card-center">
                <span className="card-suit-large">{symbol}</span>
            </div>

            <div className="card-corner bottom-right">
                <div className="card-rank">{rankDisplay}</div>
                <div className="card-suit">{symbol}</div>
            </div>
        </div>
    );
};