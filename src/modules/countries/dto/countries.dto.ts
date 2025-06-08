import { IsDefined, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsBooleanOrStringifiedBoolean } from "../../shared/custom/validators";
import { DefaultQueryDTO } from "../../shared/dto/query.dto";
import { ICreateCountry, IGetCountriesQuery } from "../interface/countries.interface";

export class CreateCountryDTO implements ICreateCountry {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;
}
export class UpdateCountryDTO implements Partial<ICreateCountry> {
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class GetCountriesQuery extends DefaultQueryDTO implements IGetCountriesQuery {
    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsBooleanOrStringifiedBoolean()
    models_count: boolean = false;

    @IsOptional()
    @IsBooleanOrStringifiedBoolean()
    brands_count: boolean = false;
}