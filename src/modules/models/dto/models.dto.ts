import { IsDefined, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { IsArrayOrStringifiedArray, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";
import { CreateProductDTO } from "../../products/dto/products.dto";

export class CreateModelDTO extends CreateProductDTO {
  @IsNumberOrStringifiedNumber()
  length: number;

  @IsNumberOrStringifiedNumber()
  height: number;

  @IsNumberOrStringifiedNumber()
  width: string | number;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  yamo_id: string;

  @IsNumberOrStringifiedNumber()
  polygons_count: string | number;

  @IsNumberOrStringifiedNumber()
  vertices_count: string | number;

  @IsString()
  brand_id: number;

  @IsString()
  formfactor_id: number;

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

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;
}

export class UpdateModelDTO {

  @IsString()
  @MaxLength(1024)
  title: string;

  @IsString()
  description: string;

  @IsNumberOrStringifiedNumber()
  length: string | number;

  @IsNumberOrStringifiedNumber()
  height: string | number;

  @IsNumberOrStringifiedNumber()
  width: string | number;

  @IsNumberOrStringifiedNumber()
  polygons_count: string | number;

  @IsNumberOrStringifiedNumber()
  vertices_count: string | number;

  @IsString()
  brand_id: number;

  @IsString()
  cost_id: string;

  @IsString()
  style_id: string;

  @IsString()
  yamo_id: string;

  @IsString()
  formfactor_id: number;

  @IsString()
  slug: string;

  @IsNumberOrStringifiedNumber()
  category_id: string | number;
}