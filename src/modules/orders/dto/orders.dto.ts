import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { ValidateUuidDTO } from "../../../modules/shared/dto/params.dto";
import { IUpdateOrder } from "../interface/orders.interface";
import { IsNumberOrStringifiedNumber } from "../../shared/custom/validators";

export class UpdateOrderDTO implements IUpdateOrder {
  @IsDefined()
  @IsNumberOrStringifiedNumber()
  status: number;
}
export class AddItemDTO {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  model_id: string;
}
export class UserIdAndStatusDTO extends ValidateUuidDTO {
  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  status: number;
}