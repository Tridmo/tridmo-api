import { IsDefined, IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateCost } from "../interface/costs.interface";

export class CreateCostDTO implements ICreateCost {
    @IsDefined()
    @IsNotEmpty()
    @IsNumber()
    amount: string;
}
export class UpdateCostDTO implements ICreateCost {
    @IsNumber()
    amount: string;
}