import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSavedInteriotDTO {
    @IsString()
    @IsUUID()
    @IsDefined()
    @IsNotEmpty()
    interior_id: string;
}