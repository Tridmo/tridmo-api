import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";
import { DefaultQueryDTO } from "modules/shared/dto/query.dto";
import { IGetModelsQuery } from "../interface/models.interface";

export class CreateModelDTO {
  @IsString()
  @IsOptional()
  brand_id: number;

  @IsDefined()
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  model_platform_id: string;

  @IsDefined()
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  render_platform_id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  furniture_cost: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  availability: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  length: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  height: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  width: string | number;

  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  materials: number[];

  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  colors: number[];
}

export class UpdateModelDTO {
  @IsString()
  @IsOptional()
  brand_id: number;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  model_platform_id: string;

  @IsOptional()
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  render_platform_id: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  furniture_cost: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  availability: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  length: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  height: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  width: string | number;
}

export class AddMaterialsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  materials: number[];
}

export class AddColorsDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  colors: number[];
}

export class GetModelsQueryDTO extends DefaultQueryDTO implements IGetModelsQuery {
  @IsNumberOrStringifiedNumber()
  brand_id: number;

  @IsNumberOrStringifiedNumber()
  category_id: string;

  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsBooleanOrStringifiedBoolean()
  is_deleted?: boolean;
}