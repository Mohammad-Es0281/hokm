import { IsString, IsNotEmpty } from 'class-validator';

export class GameStateDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @IsString()
    @IsNotEmpty()
    playerId: string;
}