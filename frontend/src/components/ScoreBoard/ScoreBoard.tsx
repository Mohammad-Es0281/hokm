import React from 'react';
import { GameMode } from '../../types/game.types';
import { strings } from '../../utils/i18n';
import './ScoreBoard.css';

interface ScoreBoardProps {
    mode: GameMode;
    matchScore: Record<string, number>;
    currentHandScore?: Record<string, number>;
    targetHands: number;
    playerNames?: Record<string, string>;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
                                                          mode,
                                                          matchScore,
                                                          currentHandScore,
                                                          targetHands,
                                                          playerNames = {},
                                                      }) => {
    const isTeamGame = mode === GameMode.FOUR_PLAYER;

    const getDisplayName = (key: string) => {
        if (isTeamGame) {
            return key === 'team_0' ? 'تیم ۱' : 'تیم ۲';
        }
        return playerNames[key] || key;
    };

    return (
        <div className="scoreboard">
            <div className="scoreboard-section">
                <div className="scoreboard-title">{strings.hands}</div>
                <div className="scoreboard-items">
                    {Object.entries(matchScore).map(([key, score]) => (
                        <div key={key} className="scoreboard-item">
                            <span className="scoreboard-label">{getDisplayName(key)}</span>
                            <span className="scoreboard-value">
                {score} / {targetHands}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {currentHandScore && (
                <div className="scoreboard-section">
                    <div className="scoreboard-title">{strings.tricks}</div>
                    <div className="scoreboard-items">
                        {Object.entries(currentHandScore).map(([key, score]) => (
                            <div key={key} className="scoreboard-item">
                                <span className="scoreboard-label">{getDisplayName(key)}</span>
                                <span className="scoreboard-value">{score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};