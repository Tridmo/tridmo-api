import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";
import { ICreateStyle } from "./styles.interface";

export class CreateStyleDTO implements ICreateStyle {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  name: string;
}
export class UpdateStyleDTO implements ICreateStyle {
  @IsString()
  @MaxLength(1024)
  name: string;
}