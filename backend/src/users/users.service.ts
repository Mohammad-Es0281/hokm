import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    /**
     * Create or update user from Telegram data
     */
    async createOrUpdate(data: {
        telegramId: string;
        firstName: string;
        lastName?: string;
        username?: string;
        photoUrl?: string;
        languageCode?: string;
    }): Promise<User> {
        let user = await this.usersRepository.findOne({
            where: { telegramId: data.telegramId },
        });

        if (user) {
            // Update existing user
            Object.assign(user, {
                firstName: data.firstName,
                lastName: data.lastName,
                username: data.username,
                photoUrl: data.photoUrl,
                languageCode: data.languageCode,
                lastSeenAt: new Date(),
            });
        } else {
            // Create new user
            user = this.usersRepository.create({
                ...data,
                lastSeenAt: new Date(),
            });
        }

        return this.usersRepository.save(user);
    }

    /**
     * Find user by Telegram ID
     */
    async findByTelegramId(telegramId: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { telegramId } });
    }

    /**
     * Update user statistics
     */
    async updateStats(
        telegramId: string,
        stats: {
            gamesPlayed?: number;
            gamesWon?: number;
            handsWon?: number;
            tricksWon?: number;
            kotAchieved?: number;
        }
    ): Promise<void> {
        const user = await this.findByTelegramId(telegramId);
        if (user) {
            if (stats.gamesPlayed) user.gamesPlayed += stats.gamesPlayed;
            if (stats.gamesWon) user.gamesWon += stats.gamesWon;
            if (stats.handsWon) user.handsWon += stats.handsWon;
            if (stats.tricksWon) user.tricksWon += stats.tricksWon;
            if (stats.kotAchieved) user.kotAchieved += stats.kotAchieved;

            await this.usersRepository.save(user);
        }
    }

    /**
     * Get leaderboard
     */
    async getLeaderboard(limit: number = 100): Promise<User[]> {
        return this.usersRepository
            .createQueryBuilder('user')
            .orderBy('user.gamesWon', 'DESC')
            .take(limit)
            .getMany();
    }
}