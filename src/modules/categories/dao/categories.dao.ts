import KnexService from '../../../database/connection';
import { IDefaultQuery } from '../../shared/interface/query.interface';
import { getFirst } from "../../shared/utils/utils";
import { ICategory, ICreateCategory, IGetCategoriesQuery, IUpdateCategory } from "../interface/categories.interface";

export default class CategoriesDAO {
  async create({ name, description, parent_id, type }: ICreateCategory) {
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

  async update(categoryId: string | number, values: IUpdateCategory) {
    return getFirst(
      await KnexService('categories')
        .where({ id: categoryId })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async makeMainByParent(parent_id: string | number) {
    return await KnexService.raw(`
            UPDATE categories
            SET parent_id = null
            WHERE parent_id = ${parent_id};
        `)
  }

  async updateByParent(categoryId: string | number, values: IUpdateCategory) {
    return getFirst(
      await KnexService('categories')
        .where({ parent_id: categoryId })
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
        .where({ name: name })
    )
  }

  async searchByName(keyword: string) {
    return await KnexService('brands')
      .select(["id", "name", "description"])
      .whereILike('name', `${keyword}%`)
      .orWhereILike('name', `%${keyword}%`)
  }

  async getParents(filters?: { type: string; models_count?: boolean; }, sorts?: IDefaultQuery): Promise<ICategory[]> {
    const { limit, offset, order, orderBy } = sorts
    const { models_count } = filters;
    let filterBy = {}
    if (filters.type) {
      filterBy = {
        'categories.type': filters.type
      }
    }

    return await KnexService('categories')
      .select([
        "categories.id as id",
        "categories.name as name",
        "categories.type as type",
        KnexService.raw(`jsonb_agg(distinct cat) as children`),
      ])
      .leftJoin(function () {
        this.select([
          "categories.id as id",
          "categories.name as name",
          "categories.type as type",
          "categories.parent_id as parent_id",
          ...(models_count ? [KnexService.raw(`count(distinct "models"."id") as models_count`)] : [])
        ])
          .from("categories")
          .as("cat")
          .modify(q => {
            if (models_count) {
              q.leftJoin('models', { 'models.category_id': 'categories.id' })
                .groupBy('categories.id')
            }
          })
      }, "cat.parent_id", "=", "categories.id")
      .orderBy(`categories.${orderBy}`, order)
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
      .where({ parent_id: parentId })
  }

  async getByNameAndParent(name: string, parentId: any = null) {
    return getFirst(
      await KnexService('categories')
        .select(["id", "name", "description", 'type'])
        .where({ name: name, parent_id: parentId })
    )
  }

  async getById(categoryId: string | number) {
    return getFirst(
      await KnexService('categories')
        .select(["id", "name", "type", "description", "parent_id"])
        .where({ id: categoryId })
    )
  }

  async deleteById(categoryId: string | number) {
    return await KnexService('categories')
      .where({ id: categoryId })
      .delete()
  }

  async deleteByParent(categoryId: string | number) {
    return await KnexService('categories')
      .where({ parent_id: categoryId })
      .delete()
  }
}