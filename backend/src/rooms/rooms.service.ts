import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { RoomPlayer, PlayerStatus } from './entities/room-player.entity';
import { GameMode } from '../game/types/game.types';
import * as crypto from 'crypto';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,
        @InjectRepository(RoomPlayer)
        private roomPlayersRepository: Repository<RoomPlayer>,
    ) {}

    /**
     * Create a new room
     */
    async createRoom(data: {
        userId: string;
        mode: GameMode;
        turnTimer?: number;
        kotBonus?: number;
        targetHands?: number;
        isPrivate?: boolean;
    }): Promise<Room> {
        const inviteCode = data.isPrivate ? this.generateInviteCode() : undefined;

        const room = this.roomsRepository.create({
            mode: data.mode,
            turnTimer: data.turnTimer || 15,
            kotBonus: data.kotBonus || 1,
            targetHands: data.targetHands || 3,
            isPrivate: data.isPrivate || false,
            inviteCode,
            createdBy: data.userId,
        });

        await this.roomsRepository.save(room);

        // Add creator as first player
        await this.addPlayer(room.id, data.userId, 0);

        return this.findOne(room.id);
    }

    /**
     * Find room by ID
     */
    async findOne(id: string): Promise<Room> {
        const room = await this.roomsRepository.findOne({
            where: { id },
            relations: ['players', 'players.user'],
        });

        if (!room) {
            throw new NotFoundException('اتاق یافت نشد');
        }

        return room;
    }

    /**
     * Find available public rooms
     */
    async findAvailableRooms(mode?: GameMode): Promise<Room[]> {
        const query = this.roomsRepository
            .createQueryBuilder('room')
            .leftJoinAndSelect('room.players', 'players')
            .where('room.isPrivate = :isPrivate', { isPrivate: false })
            .andWhere('room.status = :status', { status: RoomStatus.WAITING });

        if (mode) {
            query.andWhere('room.mode = :mode', { mode });
        }

        const rooms = await query.getMany();

        // Filter rooms that are not full
        return rooms.filter(room => !room.isFull);
    }

    /**
     * Find room by invite code
     */
    async findByInviteCode(inviteCode: string): Promise<Room> {
        const room = await this.roomsRepository.findOne({
            where: { inviteCode },
            relations: ['players', 'players.user'],
        });

        if (!room) {
            throw new NotFoundException('کد دعوت معتبر نیست');
        }

        return room;
    }

    /**
     * Add player to room
     */
    async addPlayer(roomId: string, userId: string, position?: number): Promise<RoomPlayer> {
        const room = await this.findOne(roomId);

        // Check if room is full
        if (room.isFull) {
            throw new BadRequestException('اتاق پر است');
        }

        // Check if player already in room
        const existing = room.players.find(
            p => p.userId === userId && p.status === PlayerStatus.ACTIVE
        );
        if (existing) {
            throw new BadRequestException('شما قبلاً در این اتاق هستید');
        }

        // Determine position
        const usedPositions = room.players
            .filter(p => p.status === PlayerStatus.ACTIVE)
            .map(p => p.position);

        const finalPosition = position !== undefined
            ? position
            : this.findNextAvailablePosition(usedPositions, room.mode);

        // Assign team for 4-player mode
        const team = room.mode === GameMode.FOUR_PLAYER ? finalPosition % 2 : undefined;

        const roomPlayer = this.roomPlayersRepository.create({
            roomId: room.id,
            userId,
            position: finalPosition,
            team,
            status: PlayerStatus.ACTIVE,
        });

        await this.roomPlayersRepository.save(roomPlayer);
        return roomPlayer;
    }

    /**
     * Remove player from room
     */
    async removePlayer(roomId: string, userId: string): Promise<void> {
        const roomPlayer = await this.roomPlayersRepository.findOne({
            where: {
                roomId,
                userId,
                status: PlayerStatus.ACTIVE,
            },
        });

        if (roomPlayer) {
            roomPlayer.status = PlayerStatus.LEFT;
            await this.roomPlayersRepository.save(roomPlayer);
        }

        // If room is empty, delete it
        const room = await this.findOne(roomId);
        if (room.currentPlayerCount === 0) {
            await this.roomsRepository.delete(roomId);
        }
    }

    /**
     * Update room status
     */
    async updateStatus(roomId: string, status: RoomStatus): Promise<void> {
        await this.roomsRepository.update(roomId, { status });
    }

    /**
     * Update player socket ID
     */
    async updatePlayerSocket(roomId: string, userId: string, socketId: string): Promise<void> {
        await this.roomPlayersRepository.update(
            { roomId, userId },
            { socketId }
        );
    }

    /**
     * Get active players in room
     */
    async getActivePlayers(roomId: string): Promise<RoomPlayer[]> {
        return this.roomPlayersRepository.find({
            where: {
                roomId,
                status: PlayerStatus.ACTIVE,
            },
            relations: ['user'],
            order: { position: 'ASC' },
        });
    }

    /**
     * Check if player is in room
     */
    async isPlayerInRoom(roomId: string, userId: string): Promise<boolean> {
        const count = await this.roomPlayersRepository.count({
            where: {
                roomId,
                userId,
                status: PlayerStatus.ACTIVE,
            },
        });

        return count > 0;
    }

    /**
     * Generate unique invite code
     */
    private generateInviteCode(): string {
        return crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Find next available position
     */
    private findNextAvailablePosition(usedPositions: number[], mode: GameMode): number {
        for (let i = 0; i < mode; i++) {
            if (!usedPositions.includes(i)) {
                return i;
            }
        }
        return 0;
    }
}