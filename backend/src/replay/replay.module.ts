import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReplayService } from './replay.service';
import { ReplayController } from './replay.controller';
import { Match } from '../game/entities/match.entity';
import { Hand } from '../game/entities/hand.entity';
import { Trick } from '../game/entities/trick.entity';
import { PlayedCard } from '../game/entities/played-card.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, Hand, Trick, PlayedCard]),
        AuthModule,
    ],
    providers: [ReplayService],
    controllers: [ReplayController],
})
export class ReplayModule {}