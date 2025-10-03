import React from 'react';
import { PlayerState } from '../../types/game.types';
import { Timer } from '../Timer/Timer';
import './PlayerSeat.css';

interface PlayerSeatProps {
    player: PlayerState;
    position: 'top' | 'left' | 'right';
    turnTimer: number;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
                                                          player,
                                                          position,
                                                          turnTimer,
                                                      }) => {
    return (
        <div className={`player-seat player-seat-${position}`}>
            <div className="player-info">
                <div className="player-avatar">
                    {player.photoUrl ? (
                        <img src={player.photoUrl} alt={player.name} />
                    ) : (
                        <div className="player-avatar-placeholder">
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {player.isLeader && <div className="player-leader-badge">👑</div>}
                    {!player.connected && <div className="player-disconnected">⚠️</div>}
                </div>

                <div className="player-details">
                    <div className="player-name">{player.name}</div>
                    <div className="player-cards-count">
                        {player.hand.length} کارت
                    </div>
                </div>
            </div>

            {player.isCurrentTurn && (
                <div className="player-timer">
                    <Timer
                        timeRemaining={player.timeRemaining}
                        maxTime={turnTimer}
                        isActive={true}
                    />
                </div>
            )}

            {player.isCurrentTurn && (
                <div className="player-turn-indicator">
                    نوبت بازی
                </div>
            )}
        </div>
    );
};