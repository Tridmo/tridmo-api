import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateColor } from "../interface/colors.interface";

export class CreateColorDTO implements ICreateColor {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    name: string;

    @IsString()
    @IsDefined()
    @IsNotEmpty()
    @MaxLength(7)
    hex_value: string;
}
export class UpdateColorDTO implements ICreateColor {
    @IsString()
    @MaxLength(1024)
    name: string;

    @IsString()
    @MaxLength(7)
    hex_value: string;
}