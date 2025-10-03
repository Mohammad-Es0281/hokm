import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TelegramConfig } from '../config/telegram.config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    /**
     * Validate Telegram Web App data and create/update user
     */
    async validateTelegramAuth(initData: string): Promise<{ token: string; user: any }> {
        // Validate initData
        const isValid = TelegramConfig.validateInitData(initData);
        if (!isValid) {
            throw new UnauthorizedException('Invalid Telegram authentication');
        }

        // Parse user data
        const telegramUser = TelegramConfig.parseInitData(initData);
        if (!telegramUser) {
            throw new UnauthorizedException('Could not parse user data');
        }

        // Create or update user
        const user = await this.usersService.createOrUpdate({
            telegramId: telegramUser.id.toString(),
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
            username: telegramUser.username,
            photoUrl: telegramUser.photo_url,
            languageCode: telegramUser.language_code,
        });

        // Generate JWT
        const token = this.jwtService.sign({
            sub: user.telegramId,
            username: user.username,
        });

        return { token, user };
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}