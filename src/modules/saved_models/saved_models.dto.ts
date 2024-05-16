import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSavedInteriorDTO {
    @IsString()
    @IsUUID()
    @IsDefined()
    @IsNotEmpty()
    model_id: string;
}