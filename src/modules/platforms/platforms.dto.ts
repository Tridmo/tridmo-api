import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ICreatePlatform, IUpdatePlatform } from './platforms.interface';

export class CreatePlatformDto implements ICreatePlatform {
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsDefined()
    @IsNotEmpty()
    type: number;
}

export class UpdatePlatformDto implements IUpdatePlatform {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    type?: number;
}