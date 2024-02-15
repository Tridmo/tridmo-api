import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { ICreateBrand, IUpdateBrand } from "../interface/brands.interface";

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
    @MinLength(6)
    password: string;
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
}