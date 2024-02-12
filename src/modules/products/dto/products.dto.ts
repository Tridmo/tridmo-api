import { IsArray, IsBoolean, IsBooleanString, IsDefined, IsNotEmpty, IsNumber, IsNumberString, IsString, IsUUID, MaxLength, Min } from "class-validator";
import { DefaultQueryDTO } from "../../shared/dto/query.dto";
import { ICreateProduct, IGetProductsQuery, IUpdateProduct } from "../interface/products.interface";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean, IsNumberOrStringifiedNumber } from "../../shared/custom/validators";

export class CreateProductDTO implements ICreateProduct {

    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(1024)
    title: string;
    
    @IsString()
    @IsDefined()
    @IsNotEmpty()
    description: string;
    
    @IsDefined()
    @IsNumberOrStringifiedNumber()
    cost_id: number;

    @IsNumberOrStringifiedNumber()
    style_id: number; 

    @IsString()
    slug: string;

    @IsBooleanOrStringifiedBoolean()
    is_free: Boolean
}

export class UpdateProductDTO implements IUpdateProduct{

    @IsString()
    @MaxLength(1024)
    title: string;

    @IsString()
    description: string;

    @IsNumberOrStringifiedNumber()
    length: number;

    @IsNumberOrStringifiedNumber()
    height: number;

    @IsNumberOrStringifiedNumber()
    width: number;

    @IsNumberOrStringifiedNumber()
    @Min(1)
    polygons_count: number;

    @IsNumberOrStringifiedNumber()
    @Min(1)
    vertices_count: number;

    @IsNumberOrStringifiedNumber()
    brand_id: number;
 
    @IsNumberOrStringifiedNumber()
    cost_id: number;

    @IsNumberOrStringifiedNumber()
    style_id: number;

    @IsNumberOrStringifiedNumber()
    category_id: number;

    @IsNumberOrStringifiedNumber()
    formfactor_id: number;

    @IsString()
    slug: string;

    @IsBooleanOrStringifiedBoolean()
    is_free: Boolean
}

export class AddMaterialsDTO {
  @IsDefined()
    @IsNotEmpty()
    @IsArrayOrStringifiedArray({
      allowEmptyArray: false,
      typeOfArrayItems: ['number', 'string']
    })
    materials: number[];
}

export class AddColorsDTO {
    @IsDefined()
    @IsNotEmpty()
    @IsArrayOrStringifiedArray({
      allowEmptyArray: false,
      typeOfArrayItems: ['number', 'string']
    })
    colors: number[];
}

export class GetProductsQueryDTO extends DefaultQueryDTO implements IGetProductsQuery {
    @IsNumberOrStringifiedNumber()
    brand_id: number;

    @IsNumberOrStringifiedNumber()
    category_id: string;

    @IsNumberOrStringifiedNumber()
    style_id: number;

    @IsNumberOrStringifiedNumber()
    cost_id: number;

    @IsNumberOrStringifiedNumber()
    formfactor_id: number;

    @IsBooleanOrStringifiedBoolean()
    is_deleted?: boolean;
}