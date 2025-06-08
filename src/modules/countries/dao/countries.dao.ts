import { IDefaultQuery } from 'modules/shared/interface/query.interface';
import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateCountry, IGetCountriesQuery } from "../interface/countries.interface";

export default class CountriesDAO {
    async create({name}: ICreateCountry) {
        return getFirst(
            await KnexService('countries')
            .insert({
                name
            })
            .returning("*")
        )
    }

    async update(id: string, values: ICreateCountry) {
        return getFirst(
            await KnexService('countries')
            .where({id: id})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(filters: IGetCountriesQuery, sorts: IDefaultQuery) {
        const { name, models_count, brands_count } = filters;
        const { order } = sorts;
    
        // Subquery: Count of models per country
        const modelsSubquery = KnexService("brands")
        .leftJoin("models as m", "brands.id", "m.brand_id")
        .select("brands.country_id")
        .count("m.id as models_count")
        .groupBy("brands.country_id")
        .as("brand_models");

        // Subquery: Count of brands per country
        const brandsSubquery = KnexService("brands")
            .select("brands.country_id")
            .count("brands.id as brands_count")
            .groupBy("brands.country_id")
            .as("brand_counts");


        const modelsCountSelector = models_count ? [KnexService.raw("COALESCE(brand_models.models_count, 0) as models_count")] : []
        const brandsCountSelector = brands_count ? [KnexService.raw("COALESCE(brand_counts.brands_count, 0) as brands_count")] : []

        const groupByClause = ['countries.id']
        if (brands_count) {
            groupByClause.push("brand_counts.brands_count")
        }
        if (models_count) {
            groupByClause.push("brand_models.models_count")
        }
        
        return await KnexService("countries")
            .select([
                "countries.id",
                "countries.name",
                ...modelsCountSelector,
                ...brandsCountSelector
            ])
            .orderBy("countries.name", order)
            .modify(q => {
                if (name) {
                    q.where("countries.name", "ilike", `%${name}%`);
                }
                if (brands_count) {
                    q.leftJoin(brandsSubquery, "countries.id", "brand_counts.country_id")
                }
                if (models_count) {
                    q.leftJoin(modelsSubquery, "countries.id", "brand_models.country_id")
                }
            })
            .groupBy(...groupByClause)
    }
    

    async getById(id: string) {
        return getFirst(
            await KnexService('countries')
            .where({id: id})
        )
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('countries')
            .where({name: name})
        )
    }

    async delete(id: string) {
        return getFirst(
            await KnexService('countries')
            .where({id: id})
            .delete()
        )
    }
}