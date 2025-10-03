import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';
import { Room } from '../../types/room.types';
import { GameMode } from '../../types/game.types';
import { strings } from '../../utils/i18n';
import { useTelegram } from '../../hooks/useTelegram';
import './Lobby.css';

interface LobbyProps {
    userId: string;
}

export const Lobby: React.FC<LobbyProps> = ({ userId }) => {
    const navigate = useNavigate();
    const { hapticFeedback } = useTelegram();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMode, setSelectedMode] = useState<GameMode | undefined>();

    const loadRooms = async () => {
        try {
            const data = await apiService.getAvailableRooms(selectedMode);
            setRooms(data);
        } catch (error) {
            console.error('Failed to load rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
        const interval = setInterval(loadRooms, 5000);
        return () => clearInterval(interval);
    }, [selectedMode]);

    const handleCreateRoom = () => {
        hapticFeedback('light');
        navigate('/create');
    };

    const handleJoinRoom = async (roomId: string) => {
        hapticFeedback('medium');
        try {
            await apiService.joinRoom(roomId, userId);
            navigate(`/room/${roomId}`);
        } catch (error) {
            console.error('Failed to join room:', error);
        }
    };

    const getModeText = (mode: GameMode) => {
        switch (mode) {
            case GameMode.TWO_PLAYER:
                return strings.twoPlayer;
            case GameMode.THREE_PLAYER:
                return strings.threePlayer;
            case GameMode.FOUR_PLAYER:
                return strings.fourPlayer;
        }
    };

    return (
        <div className="lobby">
            <div className="lobby-header">
                <h1 className="lobby-title">{strings.appName}</h1>
                <button className="btn btn-primary" onClick={handleCreateRoom}>
                    {strings.createRoom}
                </button>
            </div>

            <div className="lobby-filters">
                <button
                    className={`filter-btn ${!selectedMode ? 'active' : ''}`}
                    onClick={() => setSelectedMode(undefined)}
                >
                    همه
                </button>
                <button
                    className={`filter-btn ${selectedMode === GameMode.TWO_PLAYER ? 'active' : ''}`}
                    onClick={() => setSelectedMode(GameMode.TWO_PLAYER)}
                >
                    ۲ نفره
                </button>
                <button
                    className={`filter-btn ${selectedMode === GameMode.THREE_PLAYER ? 'active' : ''}`}
                    onClick={() => setSelectedMode(GameMode.THREE_PLAYER)}
                >
                    ۳ نفره
                </button>
                <button
                    className={`filter-btn ${selectedMode === GameMode.FOUR_PLAYER ? 'active' : ''}`}
                    onClick={() => setSelectedMode(GameMode.FOUR_PLAYER)}
                >
                    ۴ نفره
                </button>
            </div>

            <div className="lobby-content">
                {isLoading ? (
                    <div className="lobby-loading">{strings.loading}</div>
                ) : rooms.length === 0 ? (
                    <div className="lobby-empty">
                        <p>{strings.noRoomsAvailable}</p>
                        <button className="btn btn-secondary" onClick={loadRooms}>
                            {strings.refresh}
                        </button>
                    </div>
                ) : (
                    <div className="rooms-list">
                        {rooms.map((room) => (
                            <div key={room.id} className="room-card">
                                <div className="room-info">
                                    <div className="room-mode">{getModeText(room.mode)}</div>
                                    <div className="room-players">
                                        {room.currentPlayerCount} / {room.mode}
                                    </div>
                                </div>
                                <div className="room-settings">
                                    <span>⏱️ {room.turnTimer}ث</span>
                                    <span>🎯 {room.targetHands} دست</span>
                                </div>
                                <button
                                    className="btn btn-join"
                                    onClick={() => handleJoinRoom(room.id)}
                                >
                                    {strings.joinRoom}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};