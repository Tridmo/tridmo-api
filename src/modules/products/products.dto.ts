import { IsBoolean, IsBooleanString, IsDateString, IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../shared/custom/validators";
import { DefaultQueryDTO } from "../shared/dto/query.dto";
import { ICreateProduct, ICreateProductFromModel, IGetProductsQuery, IUpdateProduct } from "./products.interface";

export class GetCartProductsQueryDTO extends DefaultQueryDTO {
  @IsDefined()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['string']
  })
  in?: string[];
}

export class CreateProductDTO implements ICreateProduct {
  @IsDefined()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDefined()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  discount_percent?: number;

  @IsOptional()
  @IsString()
  discount_until?: Date;

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  has_delivery?: boolean;

  @IsDefined()
  @IsNumberOrStringifiedNumber()
  @IsNotEmpty()
  price: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  length: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  height: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  width: number;

  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['string']
  })
  materials: string[];

  @IsDefined()
  @IsNotEmpty()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['string']
  })
  colors: string[];
}

export class CreateProductFromModelDTO implements ICreateProductFromModel {
  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  discount_percent?: number;

  @IsOptional()
  @IsDateString()
  discount_until?: Date;

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  has_delivery?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberOrStringifiedNumber()
  price: string;
}

export class UpdateProductDTO implements IUpdateProduct {
  @IsOptional()
  @IsNumberOrStringifiedNumber()
  category_id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  discount_percent?: number;

  @IsOptional()
  @IsString()
  discount_until?: Date;

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  has_delivery?: boolean;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  price: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  length: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  height: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  width: number;

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['string']
  })
  materials: string[];

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: false,
    typeOfArrayItems: ['string']
  })
  colors: string[];

  @IsOptional()
  @IsArrayOrStringifiedArray({
    allowEmptyArray: true,
    typeOfArrayItems: ['string']
  })
  removed_images: string[];
}

export class GetProductsQueryDTO extends DefaultQueryDTO implements IGetProductsQuery {
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  categories: any[];

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  is_deleted: boolean;

  @IsOptional()
  colors: string[];

  @IsOptional()
  materials: string[];

  @IsOptional()
  exclude_products: string[];

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  has_delivery: boolean;

  @IsOptional()
  @IsBooleanOrStringifiedBoolean()
  has_discount: number;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  max_price: string;

  @IsOptional()
  @IsNumberOrStringifiedNumber()
  @Min(0)
  min_price: string;
}