import { IsDefined, IsNotEmpty } from "class-validator";
import { IsArrayOrStringifiedArray, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";

export class CreateCollectionDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false, 
    typeOfArrayItems: ['string'] 
  })
  products: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsArrayOrStringifiedArray({ typeOfArrayItems: ['number'] })
  colors: number[]
}
