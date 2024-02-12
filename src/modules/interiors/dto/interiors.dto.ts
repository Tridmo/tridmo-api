import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { IsArrayOrStringifiedArray, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";
import { CreateProductDTO } from "../../products/dto/products.dto";

export class CreateInteriorDTO extends CreateProductDTO{
  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({ typeOfArrayItems: ['number', 'string'] })
  colors: number[];

  @IsArrayOrStringifiedArray({ typeOfArrayItems: ['string'] })
  models: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: string | number;
}

export class UpdateInteriorDTO {
  @IsArrayOrStringifiedArray({ typeOfArrayItems: ['number', 'string'] })
  colors: number[];

  @IsArrayOrStringifiedArray({ typeOfArrayItems: ['string'] })
  models: string[];

  @IsNumberOrStringifiedNumber()
  category_id: string | number;
}