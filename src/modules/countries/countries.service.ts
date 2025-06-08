import { isEmpty } from "class-validator";
import { IDefaultQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import { reqT } from "../shared/utils/language";
import CountriesDAO from "./dao/countries.dao";
import { ICountry, ICreateCountry, IGetCountriesQuery } from "./interface/countries.interface";

export default class CountryService {
    private readonly countriesDao = new CountriesDAO()

    async create({name}: ICreateCountry) {
        const foundCountry: ICountry = await this.countriesDao.getByName(name);        
        if (foundCountry) {
          throw new ErrorResponse(400, reqT('same_name_exists'));
        }
        const data: ICountry = await this.countriesDao.create({
            name
        })
        
        return data
    }

    async update(id: string, values: ICreateCountry) {
        const country: ICountry = await this.countriesDao.getById(id);
        if (isEmpty(country)) {
          throw new ErrorResponse(400, reqT('not_found'));
        }
        const foundCountry: ICountry = await this.countriesDao.getByName(values.name);        
        if (foundCountry) {
          throw new ErrorResponse(400, reqT('same_name_exists'));
        }
        const data: ICountry = await this.countriesDao.update(id, values)
        
        return data
    }

    async findAll(filters: IGetCountriesQuery, sorts: IDefaultQuery) {
        const countries = await this.countriesDao.getAll(filters, sorts);
        return countries
    }

    async findOne(id: string) {
        const data = await this.countriesDao.getById(id);
        if (isEmpty(data)) {
            throw new ErrorResponse(400, reqT('not_found'));
        }

        return data
    }

    async delete(id: string) {
        const data = await this.countriesDao.delete(id);
        return data;
    }
}