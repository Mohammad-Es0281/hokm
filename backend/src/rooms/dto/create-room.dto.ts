import { IsEnum, IsNumber, IsBoolean, IsOptional, IsString, Min, Max } from 'class-validator';
import { GameMode } from '../../game/types/game.types';

export class CreateRoomDto {
    @IsString()
    userId: string;

    @IsEnum(GameMode)
    mode: GameMode;

    @IsOptional()
    @IsNumber()
    @Min(15)
    @Max(60)
    turnTimer?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(3)
    kotBonus?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(7)
    targetHands?: number;

    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;
}