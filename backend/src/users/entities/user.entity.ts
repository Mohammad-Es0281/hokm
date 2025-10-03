import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoomPlayer } from '../../rooms/entities/room-player.entity';

@Entity('users')
export class User {
    @PrimaryColumn({ type: 'bigint' })
    telegramId: string;

    @Column()
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    username: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column({ nullable: true })
    languageCode: string;

    @Column({ default: 0 })
    gamesPlayed: number;

    @Column({ default: 0 })
    gamesWon: number;

    @Column({ default: 0 })
    handsWon: number;

    @Column({ default: 0 })
    tricksWon: number;

    @Column({ default: 0 })
    kotAchieved: number;

    @Column({ type: 'timestamp', nullable: true })
    lastSeenAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RoomPlayer, (roomPlayer) => roomPlayer.user)
    roomPlayers: RoomPlayer[];

    get fullName(): string {
        return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
    }
}