import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateFormfactor } from "../interface/formfactors.interface";

export class CreateFormfactorDTO implements ICreateFormfactor {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    name: string;
}
export class UpdateFormfactorDTO implements ICreateFormfactor {
    @IsString()
    @MaxLength(1024)
    name: string;
}