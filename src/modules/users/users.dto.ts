import { IsDate, IsDefined, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { IUpdateUser, IUpdateUserEmail, IUpdateUserPassword } from "./users.interface";

export class UpdateUserDTO implements IUpdateUser {
  @IsString()
  full_name?: string;

  @IsString()
  username?: string;

  @IsString()
  company_name?: string;

  @IsString()
  address?: string;

  @IsString()
  telegram?: string;

  @IsString()
  portfolio_link?: string;

  @IsString()
  instagram?: string;

  @IsString()
  linkedin?: string;
}
export class UpdateUserEmailDTO implements IUpdateUserEmail {
  @IsEmail()
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  email: string;
}
export class UpdateUserPasswordDTO implements IUpdateUserPassword {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  new_password: string;
}