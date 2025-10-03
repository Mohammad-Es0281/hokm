import { IsString, IsNotEmpty } from 'class-validator';

export class PlayCardDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @IsString()
    @IsNotEmpty()
    playerId: string;

    @IsString()
    @IsNotEmpty()
    cardId: string;
}