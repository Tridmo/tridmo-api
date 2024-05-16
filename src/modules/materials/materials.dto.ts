import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateMaterial } from "./materials.interface";

export class CreateMaterialDTO implements ICreateMaterial {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  name: string;
}
export class UpdateMaterialDTO implements ICreateMaterial {
  @IsString()
  @MaxLength(1024)
  name: string;
}