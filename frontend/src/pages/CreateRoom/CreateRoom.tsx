import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { GameMode } from '../../types/game.types';
import { strings } from '../../utils/i18n';
import { useTelegram } from '../../hooks/useTelegram';
import './CreateRoom.css';

interface CreateRoomProps {
    userId: string;
}

export const CreateRoom: React.FC<CreateRoomProps> = ({ userId }) => {
    const navigate = useNavigate();
    const { showBackButton, hideBackButton, hapticFeedback } = useTelegram();
    const [mode, setMode] = useState<GameMode>(GameMode.FOUR_PLAYER);
    const [turnTimer, setTurnTimer] = useState(15);
    const [kotBonus, setKotBonus] = useState(1);
    const [targetHands, setTargetHands] = useState(3);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    React.useEffect(() => {
        showBackButton(() => navigate('/'));
        return () => hideBackButton();
    }, [showBackButton, hideBackButton, navigate]);

    const handleCreate = async () => {
        hapticFeedback('medium');
        setIsCreating(true);

        try {
            const room = await apiService.createRoom({
                userId,
                mode,
                turnTimer,
                kotBonus,
                targetHands,
                isPrivate,
            });

            navigate(`/room/${room.id}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            hapticFeedback('error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="create-room">
            <div className="create-room-container">
                <h1 className="create-room-title">{strings.createRoom}</h1>

                <div className="form-group">
                    <label className="form-label">{strings.selectGameMode}</label>
                    <div className="mode-buttons">
                        <button
                            className={`mode-btn ${mode === GameMode.TWO_PLAYER ? 'active' : ''}`}
                            onClick={() => setMode(GameMode.TWO_PLAYER)}
                        >
                            {strings.twoPlayer}
                        </button>
                        <button
                            className={`mode-btn ${mode === GameMode.THREE_PLAYER ? 'active' : ''}`}
                            onClick={() => setMode(GameMode.THREE_PLAYER)}
                        >
                            {strings.threePlayer}
                        </button>
                        <button
                            className={`mode-btn ${mode === GameMode.FOUR_PLAYER ? 'active' : ''}`}
                            onClick={() => setMode(GameMode.FOUR_PLAYER)}
                        >
                            {strings.fourPlayer}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {strings.turnTimer}: {turnTimer} {strings.seconds}
                    </label>
                    <input
                        type="range"
                        min="15"
                        max="60"
                        step="15"
                        value={turnTimer}
                        onChange={(e) => setTurnTimer(Number(e.target.value))}
                        className="range-input"
                    />
                    <div className="range-values">
                        <span>۱۵</span>
                        <span>۳۰</span>
                        <span>۴۵</span>
                        <span>۶۰</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {strings.kotBonus}: +{kotBonus} دست
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="1"
                        value={kotBonus}
                        onChange={(e) => setKotBonus(Number(e.target.value))}
                        className="range-input"
                    />
                    <div className="range-values">
                        <span>۰</span>
                        <span>۱</span>
                        <span>۲</span>
                        <span>۳</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {strings.targetHands}: {strings.bestOf} {targetHands}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="7"
                        step="2"
                        value={targetHands}
                        onChange={(e) => setTargetHands(Number(e.target.value))}
                        className="range-input"
                    />
                    <div className="range-values">
                        <span>۱</span>
                        <span>۳</span>
                        <span>۵</span>
                        <span>۷</span>
                    </div>
                </div>

                <div className="form-group">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                        />
                        <span>{strings.privateRoom}</span>
                    </label>
                </div>

                <button
                    className="btn btn-create"
                    onClick={handleCreate}
                    disabled={isCreating}
                >
                    {isCreating ? strings.loading : strings.createRoom}
                </button>
            </div>
        </div>
    );
};