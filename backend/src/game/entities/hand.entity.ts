import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Match } from './match.entity';
import { Trick } from './trick.entity';
import { Suit } from '../types/card.types';

@Entity('hands')
export class Hand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    matchId: string;

    @Column()
    handNumber: number;

    @Column({
        type: 'enum',
        enum: Suit,
        nullable: true,
    })
    trumpSuit: Suit;

    @Column()
    trumpSelectedBy: string; // playerId

    @Column()
    leaderId: string; // playerId who deals/chooses trump

    @Column('jsonb')
    dealPattern: number[];

    @Column('jsonb')
    initialHands: Record<string, string[]>; // playerId -> card IDs (for replay)

    @Column('jsonb')
    scores: Record<string, number>; // playerId or teamId -> tricks won

    @Column({ nullable: true })
    winnerId: string; // playerId or teamId

    @Column({ default: false })
    isKot: boolean; // 7-0 victory

    @Column()
    deckHash: string; // Hash of shuffled deck for verification

    @CreateDateColumn()
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @ManyToOne(() => Match, (match) => match.hands)
    @JoinColumn({ name: 'matchId' })
    match: Match;

    @OneToMany(() => Trick, (trick) => trick.hand, { cascade: true })
    tricks: Trick[];
}