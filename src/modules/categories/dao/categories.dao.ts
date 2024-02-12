import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateCategory, IGetCategoriesQuery } from "../interface/categories.interface";

export default class CategoriesDAO {
    async create({name, description, parent_id, type}: ICreateCategory) {
        return getFirst(
            await KnexService('categories')
            .insert({
                name,
                description,
                parent_id,
                type
            })
            .returning("*")
        )
    }

    async update(categoryId: string | number, values: ICreateCategory) {
        return getFirst(
            await KnexService('categories')
            .where({id: categoryId})
            .update({
                ...values
            })
            .returning("*")
        )
    }

    async getAll(filters?) {
        return await KnexService('categories')
            .select(["id", "name", "description", 'type'])
            .where(filters)
    }

    async getByName(name: string) {
        return getFirst(
            await KnexService('categories')
            .select(["id", "name", "description"])
            .where({name: name})
        )
    }

    async searchByName(keyword: string) {
        return await KnexService('brands')
            .select(["id", "name", "description"])
            .whereILike('name', `${keyword}%`)
            .orWhereILike('name', `%${keyword}%`)
    }

    async getParents(filters?: {type: string}) {
        let filterBy = {}
        if(filters.type) {
            filterBy = {
                'categories.type': filters.type
            }
        }
        
        return await KnexService('categories')
        .select([
            "categories.id as id",
            "categories.name as name",
            "categories.type as type",
            KnexService.raw(`jsonb_agg(distinct cat) as children`)
        ])
        .leftJoin(function(){
            this.select([
                "id",
                "name",
                'type',
                "parent_id"
            ])
            .from("categories")
            .as("cat")
        }, "cat.parent_id", "=", "categories.id")
        .whereNull("categories.parent_id")
        .where(filterBy)
        .groupBy("categories.id")
    }

    async getChildren() {
        return await KnexService('categories')
            .select(["id", "name", "description", "parent_id", 'type'])
            .whereNotNull("parent_id")
    }

    async getByParent(parentId: string | number) {
        return await KnexService('categories')
            .select(["id", "name", "description", 'type'])
            .where({parent_id: parentId})
    }

    async getByNameAndParent(name: string, parentId: any = null) {
        return getFirst(
            await KnexService('categories')
            .select(["id", "name", "description", 'type'])
            .where({name: name, parent_id: parentId})
        )
    }

    async getById(categoryId: string | number) {
        return getFirst(
            await KnexService('categories')
            .select(["id", "name", "description", "parent_id"])
            .where({id: categoryId})
        )
    }

    async deleteById(categoryId: string | number) {
        return await KnexService('categories')
            .where({id: categoryId})
            .delete()
    }
}