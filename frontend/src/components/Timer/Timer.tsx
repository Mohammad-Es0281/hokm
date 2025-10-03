import React from 'react';
import './Timer.css';

interface TimerProps {
    timeRemaining: number;
    maxTime: number;
    isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, maxTime, isActive }) => {
    const percentage = (timeRemaining / maxTime) * 100;
    const isLow = timeRemaining <= 5;
    const isCritical = timeRemaining <= 3;

    return (
        <div className={`timer ${isActive ? 'timer-active' : ''} ${isLow ? 'timer-low' : ''} ${isCritical ? 'timer-critical' : ''}`}>
            <svg className="timer-svg" viewBox="0 0 36 36">
                <path
                    className="timer-circle-bg"
                    d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                    className="timer-circle"
                    strokeDasharray={`${percentage}, 100`}
                    d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
                />
            </svg>
            <div className="timer-text">{timeRemaining}</div>
        </div>
    );
};