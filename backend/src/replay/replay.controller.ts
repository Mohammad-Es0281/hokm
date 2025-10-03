import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReplayService } from './replay.service';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';

@Controller('replay')
@UseGuards(TelegramAuthGuard)
export class ReplayController {
    constructor(private replayService: ReplayService) {}

    @Get('match/:matchId')
    async getMatchReplay(@Param('matchId') matchId: string) {
        return this.replayService.getMatchReplay(matchId);
    }

    @Get('hand/:handId')
    async getHandReplay(@Param('handId') handId: string) {
        return this.replayService.getHandReplay(handId);
    }

    @Get('trick/:trickId')
    async getTrickDetails(@Param('trickId') trickId: string) {
        return this.replayService.getTrickDetails(trickId);
    }

    @Get('player/:userId')
    async getPlayerMatchHistory(
        @Param('userId') userId: string,
        @Query('limit') limit: string = '20'
    ) {
        return this.replayService.getPlayerMatchHistory(userId, parseInt(limit, 10));
    }
}