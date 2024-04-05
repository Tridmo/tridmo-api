import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";
import { ICreateInterior, ICreateInteriorBody, IGetInteriorsQuery } from "../interface/interiors.interface";

export class CreateInteriorDTO implements ICreateInteriorBody {
  @IsDefined()
  @IsNotEmpty()
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

  @IsArrayOrStringifiedArray()
  tags: any[];
}

export class UpdateInteriorDTO {
  @IsNumberOrStringifiedNumber()
  style_id: number;

  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsString()
  render_platform_id: string;

  @IsString()
  name: string;

  @IsArrayOrStringifiedArray()
  tags: any[];
}

export class GetInteriorsQueryDTO implements IGetInteriorsQuery {
  styles?: string[];

  categories?: string[];

  @IsString()
  paltforms?: string[];

  @IsString()
  name?: string;

  @IsString()
  author?: string;

  @IsBooleanOrStringifiedBoolean()
  is_deleted?: boolean;
}