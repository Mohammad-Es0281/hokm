import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Trick } from './trick.entity';
import { Suit, Rank } from '../types/card.types';

@Entity('played_cards')
export class PlayedCard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    trickId: string;

    @Column()
    playerId: string;

    @Column({
        type: 'enum',
        enum: Suit,
    })
    suit: Suit;

    @Column({
        type: 'enum',
        enum: Rank,
    })
    rank: Rank;

    @Column()
    cardId: string; // e.g., "hearts_A"

    @Column()
    playOrder: number; // 0, 1, 2, 3

    @Column({ default: false })
    isAutoPlayed: boolean;

    @CreateDateColumn()
    playedAt: Date;

    @ManyToOne(() => Trick, (trick) => trick.playedCards)
    @JoinColumn({ name: 'trickId' })
    trick: Trick;
}