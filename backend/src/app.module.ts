import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';
import { TimerModule } from './timer/timer.module';
import { ReplayModule } from './replay/replay.module';
import { databaseConfig } from './config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot(databaseConfig),
        AuthModule,
        UsersModule,
        RoomsModule,
        GameModule,
        TimerModule,
        ReplayModule,
    ],
})
export class AppModule {}