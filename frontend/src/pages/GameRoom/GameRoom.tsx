import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useGame } from '../../hooks/useGame';
import { useTelegram } from '../../hooks/useTelegram';
import { Hand } from '../../components/Hand/Hand';
import { Table } from '../../components/Table/Table';
import { PlayerSeat } from '../../components/PlayerSeat/PlayerSeat';
import { ScoreBoard } from '../../components/ScoreBoard/ScoreBoard';
import { TrumpIndicator } from '../../components/TrumpIndicator/TrumpIndicator';
import { GamePhase, Suit } from '../../types/game.types';
import { strings } from '../../utils/i18n';
import { socketService, WS_EVENTS } from '../../services/socket.service';
import './GameRoom.css';

interface GameRoomProps {
    userId: string;
}

export const GameRoom: React.FC<GameRoomProps> = ({ userId }) => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { showBackButton, hideBackButton, hapticFeedback, showAlert } = useTelegram();
    const { isConnected } = useSocket();
    const {
        gameState,
        currentPlayer,
        myHand,
        isMyTurn,
        isLoading,
        error,
        selectTrump,
        playCard,
    } = useGame(roomId!, userId);

    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        showBackButton(() => {
            showAlert('آیا می‌خواهید از بازی خارج شوید?');
            navigate('/');
        });

        return () => hideBackButton();
    }, [showBackButton, hideBackButton, navigate]);

    useEffect(() => {
        if (!roomId) return;

        socketService.joinRoom(roomId, userId);

        // Listen for game events
        const handleTrumpSelection = (data: { leaderId: string; message: string }) => {
            if (data.leaderId === userId) {
                setMessage(strings.selectTrump);
            } else {
                setMessage('در انتظار انتخاب حکم...');
            }
        };

        const handleTrumpSelected = (data: { suit: Suit; selectedBy: string }) => {
            setMessage(null);
            hapticFeedback('success');
        };

        const handleHandComplete = (data: any) => {
            setMessage('دست تمام شد!');
            hapticFeedback('success');
            setTimeout(() => setMessage(null), 3000);
        };

        const handleMatchComplete = (data: any) => {
            setMessage('بازی تمام شد!');
            hapticFeedback('success');
        };

        socketService.on(WS_EVENTS.TRUMP_SELECTION, handleTrumpSelection);
        socketService.on(WS_EVENTS.TRUMP_SELECTED, handleTrumpSelected);
        socketService.on(WS_EVENTS.HAND_COMPLETE, handleHandComplete);
        socketService.on(WS_EVENTS.MATCH_COMPLETE, handleMatchComplete);

        return () => {
            socketService.off(WS_EVENTS.TRUMP_SELECTION, handleTrumpSelection);
            socketService.off(WS_EVENTS.TRUMP_SELECTED, handleTrumpSelected);
            socketService.off(WS_EVENTS.HAND_COMPLETE, handleHandComplete);
            socketService.off(WS_EVENTS.MATCH_COMPLETE, handleMatchComplete);
            socketService.leaveRoom(roomId, userId);
        };
    }, [roomId, userId, hapticFeedback]);

    useEffect(() => {
        if (error) {
            setMessage(error);
            hapticFeedback('error');
        }
    }, [error, hapticFeedback]);

    if (isLoading) {
        return (
            <div className="game-room-loading">
                <div className="loading-spinner" />
                <p>{strings.loading}</p>
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="game-room-error">
                <p>{strings.error}</p>
            </div>
        );
    }

    const handleTrumpSelect = (suit: Suit) => {
        selectTrump(suit);
        setMessage(null);
        hapticFeedback('medium');
    };

    const handleCardPlay = (card: any) => {
        playCard(card);
        hapticFeedback('light');
    };

    const otherPlayers = gameState.players.filter(p => p.id !== userId);
    const playerNames: Record<string, string> = {};
    gameState.players.forEach(p => {
        playerNames[p.id] = p.name;
        if (p.team !== undefined) {
            playerNames[`team_${p.team}`] = `تیم ${p.team + 1}`;
        }
    });

    const showTrumpSelector =
        gameState.phase === GamePhase.TRUMP_SELECTION &&
        currentPlayer?.isLeader;

    return (
        <div className="game-room">
            {!isConnected && (
                <div className="connection-banner">
                    {strings.reconnecting}
                </div>
            )}

            <ScoreBoard
                mode={gameState.mode}
                matchScore={gameState.matchScore}
                currentHandScore={gameState.currentHand?.scores}
                targetHands={gameState.targetHands}
                playerNames={playerNames}
            />

            {gameState.currentHand?.trumpSuit && (
                <div className="trump-indicator-container">
                    <TrumpIndicator trumpSuit={gameState.currentHand.trumpSuit} />
                </div>
            )}

            {showTrumpSelector && (
                <TrumpIndicator
                    trumpSuit={null}
                    onSelectTrump={handleTrumpSelect}
                    isSelecting={true}
                />
            )}

            {otherPlayers.map((player, index) => {
                const position = index === 0 ? 'top' : index === 1 ? 'left' : 'right';
                return (
                    <PlayerSeat
                        key={player.id}
                        player={player}
                        position={position}
                        turnTimer={gameState.settings.turnTimer}
                    />
                );
            })}

            {gameState.currentHand?.currentTrick?.playedCards.length > 0 && (
                <Table
                    playedCards={gameState.currentHand.currentTrick.playedCards}
                    playerCount={gameState.players.length}
                />
            )}

            {currentPlayer && (
                <Hand
                    cards={myHand}
                    trumpSuit={gameState.currentHand?.trumpSuit || null}
                    leadSuit={gameState.currentHand?.currentTrick?.leadSuit || null}
                    isMyTurn={isMyTurn}
                    onCardClick={handleCardPlay}
                />
            )}

            {message && (
                <div className="game-message">
                    {message}
                </div>
            )}

            {isMyTurn && !showTrumpSelector && (
                <div className="turn-indicator">
                    {strings.yourTurn}
                </div>
            )}
        </div>
    );
};