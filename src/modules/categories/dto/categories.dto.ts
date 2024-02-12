import { IsDefined, IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateCategory } from "../interface/categories.interface";
import { IsNumberOrStringifiedNumber } from "../../shared/custom/validators";

export class CreateCategoryDTO implements ICreateCategory {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;


    @IsDefined()
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsString()
    @MaxLength(1024)
    description: string;

    @IsNumberOrStringifiedNumber()
    parent_id: number;
}
export class UpdateCategoryDTO implements ICreateCategory {
    @IsString()
    name: string;

    @IsString()
    @MaxLength(1024)
    description: string;

    @IsString()
    type: string;

    @IsNumberOrStringifiedNumber()
    parent_id: number;
}