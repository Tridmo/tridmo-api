import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../shared/custom/validators";
import { DefaultQueryDTO } from "../shared/dto/query.dto";
import { ICreateModel, ICreateModelBody, IGetCountsQuery, IGetModelsQuery, IUpdateModel } from "./models.interface";

export class CreateModelDTO implements ICreateModelBody {
  @IsString()
  @IsOptional()
  brand_id: string;

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

  @IsBoolean()
  top: boolean;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  furniture_cost: string;

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
  width: number;

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

export class UpdateModelDTO implements IUpdateModel {
  @IsString()
  @IsOptional()
  brand_id: string;

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

  @IsBoolean()
  top: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  furniture_cost: string;

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
  width: number;

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  materials: string[];

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['number', 'string']
  })
  colors: string[];

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: true,
    typeOfArrayItems: ['string']
  })
  removed_images: string[];
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
  @IsString()
  name?: string;

  @IsBooleanOrStringifiedBoolean()
  top: boolean;

  @IsString()
  brand_id?: string;

  @IsNumberOrStringifiedNumber()
  availability?: number;

  categories?: any[];

  styles?: any[];

  model_platforms?: any[];

  render_platforms?: any[];

  @IsBooleanOrStringifiedBoolean()
  is_deleted?: boolean;
}

export class GetCountsQueryDTO implements IGetCountsQuery {
  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  all?: boolean;
  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  top?: boolean;
  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  available?: boolean;
  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  not_available?: boolean;
  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  deleted?: boolean;
}