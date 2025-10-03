import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';

@Controller('users')
@UseGuards(TelegramAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('leaderboard')
    async getLeaderboard(@Query('limit') limit: string = '100') {
        return this.usersService.getLeaderboard(parseInt(limit, 10));
    }

    @Get(':telegramId')
    async getUser(@Param('telegramId') telegramId: string) {
        return this.usersService.findByTelegramId(telegramId);
    }
}