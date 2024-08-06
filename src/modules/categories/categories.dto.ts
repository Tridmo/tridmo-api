import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateCategory } from "./categories.interface";
import { IsNumberOrStringifiedNumber } from "../shared/custom/validators";

export class CreateCategoryDTO implements ICreateCategory {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  section: string;

  @IsString()
  @MaxLength(1024)
  description: string;

  @IsNumberOrStringifiedNumber()
  parent_id: number;
}
export class UpdateCategoryDTO implements ICreateCategory {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  description: string;

  @IsString()
  @IsOptional()
  type: string;

  @IsString()
  @IsOptional()
  section: string;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  parent_id: number;
}