import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { TelegramAuthGuard } from '../auth/telegram-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';

@Controller('rooms')
@UseGuards(TelegramAuthGuard)
export class RoomsController {
    constructor(private roomsService: RoomsService) {}

    @Post()
    async createRoom(@Body() dto: CreateRoomDto) {
        return this.roomsService.createRoom(dto);
    }

    @Get()
    async getAvailableRooms(@Query('mode') mode?: string) {
        return this.roomsService.findAvailableRooms(mode ? parseInt(mode) : undefined);
    }

    @Get(':id')
    async getRoom(@Param('id') id: string) {
        return this.roomsService.findOne(id);
    }

    @Get('invite/:code')
    async getRoomByInviteCode(@Param('code') code: string) {
        return this.roomsService.findByInviteCode(code);
    }

    @Post(':id/join')
    async joinRoom(@Param('id') id: string, @Body() dto: JoinRoomDto) {
        return this.roomsService.addPlayer(id, dto.userId);
    }

    @Post(':id/leave')
    async leaveRoom(@Param('id') id: string, @Body() dto: { userId: string }) {
        await this.roomsService.removePlayer(id, dto.userId);
        return { success: true };
    }
}