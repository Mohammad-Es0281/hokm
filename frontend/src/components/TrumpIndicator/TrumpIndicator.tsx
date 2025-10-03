import React from 'react';
import { Suit } from '../../types/game.types';
import { getSuitSymbol, getSuitColor } from '../../utils/card.utils';
import { getSuitName } from '../../utils/i18n';
import './TrumpIndicator.css';

interface TrumpIndicatorProps {
    trumpSuit: Suit | null;
    onSelectTrump?: (suit: Suit) => void;
    isSelecting?: boolean;
}

export const TrumpIndicator: React.FC<TrumpIndicatorProps> = ({
                                                                  trumpSuit,
                                                                  onSelectTrump,
                                                                  isSelecting = false,
                                                              }) => {
    if (isSelecting && onSelectTrump) {
        return (
            <div className="trump-selector">
                <div className="trump-selector-title">حکم را انتخاب کنید</div>
                <div className="trump-selector-suits">
                    {Object.values(Suit).map((suit) => (
                        <button
                            key={suit}
                            className="trump-suit-button"
                            onClick={() => onSelectTrump(suit)}
                            style={{ color: getSuitColor(suit) }}
                        >
                            <span className="trump-suit-symbol">{getSuitSymbol(suit)}</span>
                            <span className="trump-suit-name">{getSuitName(suit)}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!trumpSuit) {
        return null;
    }

    return (
        <div className="trump-indicator">
            <span className="trump-label">حکم:</span>
            <span
                className="trump-suit"
                style={{ color: getSuitColor(trumpSuit) }}
            >
        {getSuitSymbol(trumpSuit)} {getSuitName(trumpSuit)}
      </span>
        </div>
    );
};