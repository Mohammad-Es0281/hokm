import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { GameStateManager } from './game-state.manager';
import { TrickService } from './trick.service';
import { TimerService } from '../timer/timer.service';
import { WS_EVENTS } from './types/constants';
import { Suit } from './types/card.types';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
    private socketPlayers: Map<string, { playerId: string; roomId: string }> = new Map(); // socketId -> player info

    constructor(
        private gameService: GameService,
        private gameStateManager: GameStateManager,
        private trickService: TrickService,
        private timerService: TimerService,
    ) {}

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        const playerInfo = this.socketPlayers.get(client.id);
        if (playerInfo) {
            const { playerId, roomId } = playerInfo;
            this.gameStateManager.updatePlayer(roomId, playerId, { connected: false });
            this.socketPlayers.delete(client.id);
            this.playerSockets.delete(playerId);

            // Notify room
            this.server.to(roomId).emit(WS_EVENTS.ROOM_UPDATED, {
                playerId,
                connected: false,
            });
        }
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('game:join')
    async handleJoinGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; playerId: string }
    ) {
        const { roomId, playerId } = data;

        // Check for existing connection
        const existingSocket = this.playerSockets.get(playerId);
        if (existingSocket && existingSocket !== client.id) {
            // Disconnect previous socket
            const previousSocket = this.server.sockets.sockets.get(existingSocket);
            if (previousSocket) {
                previousSocket.disconnect(true);
            }
        }

        // Register player
        this.playerSockets.set(playerId, client.id);
        this.socketPlayers.set(client.id, { playerId, roomId });

        // Join room
        client.join(roomId);

        // Update connection status
        this.gameStateManager.updatePlayer(roomId, playerId, { connected: true });

        // Send current state
        const state = this.gameService.getGameState(roomId, playerId);
        client.emit(WS_EVENTS.STATE_SYNC, state);

        // Notify others
        client.to(roomId).emit(WS_EVENTS.ROOM_UPDATED, {
            playerId,
            connected: true,
        });
    }

    @SubscribeMessage('trump:select')
    async handleSelectTrump(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; playerId: string; suit: Suit }
    ) {
        const { roomId, playerId, suit } = data;

        try {
            await this.gameService.selectTrump(roomId, playerId, suit);

            // Broadcast trump selection
            this.server.to(roomId).emit(WS_EVENTS.TRUMP_SELECTED, {
                suit,
                selectedBy: playerId,
            });

            // Start turn timer for first player
            const state = this.gameStateManager.getState(roomId);
            if (state) {
                const currentPlayer = this.gameStateManager.getCurrentTurnPlayer(roomId);
                if (currentPlayer) {
                    this.startTurnTimer(roomId, currentPlayer.id, state.settings.turnTimer);
                }

                // Broadcast updated state
                this.broadcastState(roomId);
            }
        } catch (error) {
            client.emit(WS_EVENTS.INVALID_MOVE, { message: error.message });
        }
    }

    @SubscribeMessage('card:play')
    async handlePlayCard(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; playerId: string; cardId: string }
    ) {
        const { roomId, playerId, cardId } = data;

        // Clear timer
        this.timerService.clearTimer(`${roomId}_${playerId}`);

        try {
            const result = await this.gameService.playCard(roomId, playerId, cardId);

            if (!result.valid) {
                client.emit(WS_EVENTS.INVALID_MOVE, { message: result.reason });
                return;
            }

            // Broadcast card played
            const state = this.gameStateManager.getState(roomId);
            if (state && state.currentHand) {
                const playedCard = state.currentHand.currentTrick.playedCards[
                state.currentHand.currentTrick.playedCards.length - 1
                    ];

                this.server.to(roomId).emit(WS_EVENTS.CARD_PLAYED, playedCard);

                // Check if trick is complete
                if (state.currentHand.currentTrick.playedCards.length === state.players.length) {
                    // Trick complete
                    setTimeout(() => {
                        this.server.to(roomId).emit(WS_EVENTS.TRICK_COMPLETE, {
                            winnerId: state.currentHand!.currentTrick.winnerId,
                            playedCards: state.currentHand!.currentTrick.playedCards,
                        });

                        // Check if hand is complete
                        if (state.phase === 'hand_complete') {
                            this.server.to(roomId).emit(WS_EVENTS.HAND_COMPLETE, {
                                scores: state.currentHand!.scores,
                                winnerId: state.currentHand!.tricks[state.currentHand!.tricks.length - 1].winnerId,
                            });
                        } else {
                            // Start next turn
                            const nextPlayer = this.gameStateManager.getCurrentTurnPlayer(roomId);
                            if (nextPlayer) {
                                this.startTurnTimer(roomId, nextPlayer.id, state.settings.turnTimer);
                            }
                        }

                        this.broadcastState(roomId);
                    }, 2000); // 2 second delay to show trick result
                } else {
                    // Continue to next player
                    const currentPlayer = this.gameStateManager.getCurrentTurnPlayer(roomId);
                    if (currentPlayer) {
                        this.startTurnTimer(roomId, currentPlayer.id, state.settings.turnTimer);
                    }
                    this.broadcastState(roomId);
                }
            }
        } catch (error) {
            client.emit(WS_EVENTS.INVALID_MOVE, { message: error.message });
        }
    }

    /**
     * Start turn timer
     */
    private startTurnTimer(roomId: string, playerId: string, duration: number): void {
        const timerId = `${roomId}_${playerId}`;

        this.timerService.startTimer(timerId, duration, {
            onTick: (remaining) => {
                this.server.to(roomId).emit(WS_EVENTS.TIMER_TICK, {
                    playerId,
                    timeRemaining: remaining,
                });
            },
            onTimeout: () => {
                this.handlePlayerTimeout(roomId, playerId);
            },
        });
    }

    /**
     * Handle player timeout
     */
    private async handlePlayerTimeout(roomId: string, playerId: string): Promise<void> {
        const state = this.gameStateManager.getState(roomId);
        if (!state || !state.currentHand) return;

        const player = state.players.find(p => p.id === playerId);
        if (!player) return;

        // Select card using auto-play policy
        const autoPlay = this.trickService.selectAutoPlayCard(
            player.hand,
            state.currentHand.currentTrick.leadSuit,
            state.currentHand.trumpSuit
        );

        // Emit timeout event
        this.server.to(roomId).emit(WS_EVENTS.PLAYER_TIMEOUT, {
            playerId,
            message: 'زمان شما تمام شد — یک کارت به‌صورت خودکار بازی شد',
        });

        // Play the card
        await this.gameService.playCard(roomId, playerId, autoPlay.selectedCard.id);

        // Emit auto-play event
        this.server.to(roomId).emit(WS_EVENTS.PLAYER_AUTOPLAY, {
            playerId,
            card: autoPlay.selectedCard,
            reason: autoPlay.reason,
        });

        // Continue game flow
        const updatedState = this.gameStateManager.getState(roomId);
        if (updatedState && updatedState.currentHand) {
            if (updatedState.currentHand.currentTrick.playedCards.length === updatedState.players.length) {
                // Trick complete
                setTimeout(() => {
                    this.server.to(roomId).emit(WS_EVENTS.TRICK_COMPLETE, {
                        winnerId: updatedState.currentHand!.currentTrick.winnerId,
                        playedCards: updatedState.currentHand!.currentTrick.playedCards,
                    });

                    if (updatedState.phase === 'hand_complete') {
                        this.server.to(roomId).emit(WS_EVENTS.HAND_COMPLETE, {
                            scores: updatedState.currentHand!.scores,
                        });
                    } else {
                        const nextPlayer = this.gameStateManager.getCurrentTurnPlayer(roomId);
                        if (nextPlayer) {
                            this.startTurnTimer(roomId, nextPlayer.id, updatedState.settings.turnTimer);
                        }
                    }

                    this.broadcastState(roomId);
                }, 2000);
            } else {
                const currentPlayer = this.gameStateManager.getCurrentTurnPlayer(roomId);
                if (currentPlayer) {
                    this.startTurnTimer(roomId, currentPlayer.id, updatedState.settings.turnTimer);
                }
                this.broadcastState(roomId);
            }
        }
    }

    /**
     * Broadcast game state to all players in room
     */
    private broadcastState(roomId: string): void {
        const state = this.gameStateManager.getState(roomId);
        if (!state) return;

        // Send sanitized state to each player
        state.players.forEach(player => {
            const socketId = this.playerSockets.get(player.id);
            if (socketId) {
                const sanitizedState = this.gameService.getGameState(roomId, player.id);
                this.server.to(socketId).emit(WS_EVENTS.STATE_SYNC, sanitizedState);
            }
        });
    }

    /**
     * Broadcast event to room
     */
    broadcastToRoom(roomId: string, event: string, data: any): void {
        this.server.to(roomId).emit(event, data);
    }
}