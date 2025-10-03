import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { Room } from './entities/room.entity';
import { RoomPlayer } from './entities/room-player.entity';
import { UsersModule } from '../users/users.module';
import { GameModule } from '../game/game.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Room, RoomPlayer]),
        UsersModule,
        AuthModule,
        forwardRef(() => GameModule),
    ],
    providers: [RoomsService, RoomsGateway],
    controllers: [RoomsController],
    exports: [RoomsService],
})
export class RoomsModule {}