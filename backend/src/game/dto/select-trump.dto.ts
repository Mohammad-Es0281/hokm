import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Suit } from '../types/card.types';

export class SelectTrumpDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @IsString()
    @IsNotEmpty()
    playerId: string;

    @IsEnum(Suit)
    suit: Suit;
}