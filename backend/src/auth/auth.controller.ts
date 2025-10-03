import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramInitDto } from './dto/telegram-init.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('telegram')
    async authenticateTelegram(@Body() dto: TelegramInitDto) {
        return this.authService.validateTelegramAuth(dto.initData);
    }
}