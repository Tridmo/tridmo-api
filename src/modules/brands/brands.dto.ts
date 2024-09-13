import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ICreateBrand, IUpdateBrand } from "./brands.interface";
import { IsArrayOrStringifiedArray } from "../shared/custom/validators";

export class CreateBrandDTO implements ICreateBrand {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(1024)
  site_link: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsArrayOrStringifiedArray()
  styles?: string[];
}
export class UpdateBrandDTO implements IUpdateBrand {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  site_link: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  instagram: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsArrayOrStringifiedArray()
  styles?: string[];
}