import { IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../shared/custom/validators";
import { ICreateInterior, ICreateInteriorBody, IGetInteriorsQuery, IUpdateInterior } from "./interiors.interface";

export class CreateInteriorDTO implements ICreateInteriorBody {
  @IsOptional()
  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsString()
  render_platform_id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateInteriorDTO implements IUpdateInterior {
  @IsOptional()
  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsOptional()
  @IsString()
  render_platform_id: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: true,
    typeOfArrayItems: ['string']
  })
  removed_images: string[];
}

export class UpdateInteriorStatusDTO {
  @IsOptional()
  @IsNumberOrStringifiedNumber()
  status: number;
}

export class GetInteriorsQueryDTO implements IGetInteriorsQuery {
  @IsOptional()
  styles?: string[];

  @IsOptional()
  status?: number | number[];

  @IsOptional()
  categories?: string[];

  @IsOptional()
  @IsString()
  paltforms?: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  is_deleted?: boolean;
}