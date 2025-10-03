import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Hand } from './hand.entity';
import { PlayedCard } from './played-card.entity';
import { Suit } from '../types/card.types';

@Entity('tricks')
export class Trick {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    handId: string;

    @Column()
    trickNumber: number;

    @Column()
    leadPlayerId: string;

    @Column({
        type: 'enum',
        enum: Suit,
        nullable: true,
    })
    leadSuit: Suit;

    @Column({ nullable: true })
    winnerId: string;

    @Column({ nullable: true })
    winningCardId: string;

    @CreateDateColumn()
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @ManyToOne(() => Hand, (hand) => hand.tricks)
    @JoinColumn({ name: 'handId' })
    hand: Hand;

    @OneToMany(() => PlayedCard, (playedCard) => playedCard.trick, { cascade: true })
    playedCards: PlayedCard[];
}