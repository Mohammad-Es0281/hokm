import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramInitDto {
    @IsString()
    @IsNotEmpty()
    initData: string;
}