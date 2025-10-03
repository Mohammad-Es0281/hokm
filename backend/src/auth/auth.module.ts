import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TelegramAuthGuard } from './telegram-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '30d' },
        }),
    ],
    providers: [AuthService, TelegramAuthGuard],
    controllers: [AuthController],
    exports: [AuthService, TelegramAuthGuard],
})

export class AuthModule {}