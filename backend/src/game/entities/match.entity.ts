import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';
import { Hand } from './hand.entity';

export enum MatchStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    ABANDONED = 'abandoned',
}

@Entity('matches')
export class Match {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    roomId: string;

    @Column({
        type: 'enum',
        enum: MatchStatus,
        default: MatchStatus.IN_PROGRESS,
    })
    status: MatchStatus;

    @Column('jsonb')
    playerIds: string[];

    @Column('jsonb', { nullable: true })
    teams?: Record<string, number>; // playerId -> team (0 or 1)

    @Column('jsonb')
    matchScore: Record<string, number>; // playerId or teamId -> hands won

    @Column()
    targetHands: number;

    @Column({ nullable: true })
    winnerId: string; // playerId or teamId

    @Column()
    deckCommitment: string; // Hash for initial deck verification

    @CreateDateColumn()
    startedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @ManyToOne(() => Room, (room) => room.matches)
    @JoinColumn({ name: 'roomId' })
    room: Room;

    @OneToMany(() => Hand, (hand) => hand.match, { cascade: true })
    hands: Hand[];
}