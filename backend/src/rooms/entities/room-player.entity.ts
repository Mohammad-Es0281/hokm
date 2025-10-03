import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../../users/entities/user.entity';

export enum PlayerStatus {
    ACTIVE = 'active',
    LEFT = 'left',
    DISCONNECTED = 'disconnected',
}

@Entity('room_players')
export class RoomPlayer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    roomId: string;

    @Column({ type: 'bigint' })
    userId: string;

    @Column({
        type: 'enum',
        enum: PlayerStatus,
        default: PlayerStatus.ACTIVE,
    })
    status: PlayerStatus;

    @Column()
    position: number; // 0, 1, 2, 3

    @Column({ nullable: true })
    team: number; // 0 or 1 for 4-player mode

    @Column({ nullable: true })
    socketId: string;

    @CreateDateColumn()
    joinedAt: Date;

    @ManyToOne(() => Room, (room) => room.players, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomId' })
    room: Room;

    @ManyToOne(() => User, (user) => user.roomPlayers)
    @JoinColumn({ name: 'userId' })
    user: User;
}