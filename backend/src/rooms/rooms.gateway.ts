import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import { GameService } from '../game/game.service';
import { GameGateway } from '../game/game.gateway';
import { RoomStatus } from './entities/room.entity';
import { WS_EVENTS } from '../game/types/constants';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
})
export class RoomsGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        private roomsService: RoomsService,
        private gameService: GameService,
        private gameGateway: GameGateway,
    ) {}

    @SubscribeMessage('room:join')
    async handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; userId: string }
    ) {
        const { roomId, userId } = data;

        try {
            // Check if already in room
            const isInRoom = await this.roomsService.isPlayerInRoom(roomId, userId);

            if (!isInRoom) {
                // Add player to room
                await this.roomsService.addPlayer(roomId, userId);
            }

            // Update socket ID
            await this.roomsService.updatePlayerSocket(roomId, userId, client.id);

            // Join socket room
            client.join(roomId);

            // Get updated room
            const room = await this.roomsService.findOne(roomId);

            // Broadcast to room
            this.server.to(roomId).emit(WS_EVENTS.ROOM_JOINED, {
                room,
                userId,
            });

            // Check if room is full
            if (room.isFull && room.status === RoomStatus.WAITING) {
                await this.startGame(roomId);
            }
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    @SubscribeMessage('room:leave')
    async handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { roomId: string; userId: string }
    ) {
        const { roomId, userId } = data;

        try {
            await this.roomsService.removePlayer(roomId, userId);
            client.leave(roomId);

            this.server.to(roomId).emit(WS_EVENTS.ROOM_LEFT, {
                userId,
            });
        } catch (error) {
            client.emit('error', { message: error.message });
        }
    }

    /**
     * Start game when room is full
     */
    private async startGame(roomId: string): Promise<void> {
        const room = await this.roomsService.findOne(roomId);
        const players = await this.roomsService.getActivePlayers(roomId);

        // Update room status
        await this.roomsService.updateStatus(roomId, RoomStatus.PLAYING);

        // Start match
        const playerIds = players.map(p => p.userId);
        const { match, state } = await this.gameService.startMatch(room, playerIds);

        // Randomly select first leader
        const randomLeader = playerIds[Math.floor(Math.random() * playerIds.length)];

        // Start first hand
        await this.gameService.startHand(roomId, match.id, 1, randomLeader);

        // Broadcast game started
        this.server.to(roomId).emit(WS_EVENTS.GAME_STARTED, {
            matchId: match.id,
            leaderId: randomLeader,
        });

        // Notify game gateway
        this.gameGateway.broadcastToRoom(roomId, WS_EVENTS.TRUMP_SELECTION, {
            leaderId: randomLeader,
            message: 'لطفاً حکم را انتخاب کنید',
        });
    }
}