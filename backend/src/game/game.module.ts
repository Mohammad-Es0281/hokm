import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameStateManager } from './game-state.manager';
import { DeckService } from './deck.service';
import { TrickService } from './trick.service';
import { ScoringService } from './scoring.service';
import { Match } from './entities/match.entity';
import { Hand } from './entities/hand.entity';
import { Trick } from './entities/trick.entity';
import { PlayedCard } from './entities/played-card.entity';
import { TimerModule } from '../timer/timer.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, Hand, Trick, PlayedCard]),
        TimerModule,
        UsersModule,
    ],
    providers: [
        GameService,
        GameGateway,
        GameStateManager,
        DeckService,
        TrickService,
        ScoringService,
    ],
    exports: [GameService, GameStateManager, GameGateway],
})
export class GameModule {}