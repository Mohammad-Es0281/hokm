import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoomPlayer } from './room-player.entity';
import { Match } from '../../game/entities/match.entity';
import { GameMode } from '../../game/types/game.types';

export enum RoomStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: GameMode,
    })
    mode: GameMode;

    @Column({
        type: 'enum',
        enum: RoomStatus,
        default: RoomStatus.WAITING,
    })
    status: RoomStatus;

    @Column({ default: 15 })
    turnTimer: number;

    @Column({ default: 1 })
    kotBonus: number;

    @Column({ default: 3 })
    targetHands: number;

    @Column({ default: false })
    isPrivate: boolean;

    @Column({ nullable: true })
    inviteCode?: string;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RoomPlayer, (roomPlayer) => roomPlayer.room, { cascade: true })
    players: RoomPlayer[];

    @OneToMany(() => Match, (match) => match.room)
    matches: Match[];

    get currentPlayerCount(): number {
        return this.players?.filter(p => p.status === 'active').length || 0;
    }

    get isFull(): boolean {
        return this.currentPlayerCount === this.mode;
    }
}