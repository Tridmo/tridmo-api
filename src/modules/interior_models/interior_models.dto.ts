import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";;
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean } from "../shared/custom/validators";
import { IInteriorModelBody } from "./interior_models.interface";

export class CreateInteriorModelDTO implements IInteriorModelBody {
  @IsString()
  @IsDefined()
  model_id: string;

  @IsString()
  @IsDefined()
  interior_id: string;

  @IsString()
  @IsDefined()
  interior_image_id: string;

  @IsNumber()
  @IsDefined()
  x: number;

  @IsNumber()
  @IsDefined()
  y: number;
}