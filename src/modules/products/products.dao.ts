import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateProduct, IGetProductsQuery, IProduct, IUpdateProduct } from "./products.interface";
import KnexService from "../../database/connection";
import { isUUID } from 'class-validator';

export default class ProductsDAO {

  async create(data: ICreateProduct) {
    return getFirst(
      await KnexService('products')
        .insert({ ...data })
        .returning("*")
    )
  }

  async update(product_id: string, values: IUpdateProduct) {
    return getFirst(
      await KnexService('products')
        .where({ id: product_id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async count(filters: IGetProductsQuery) {
    const { categories, exclude_products, name, ...otherFilters } = filters

    return (
      await KnexService('products')
        .countDistinct("products.id")
        .where({ is_deleted: false })
        .modify((query) => {
          if (exclude_products && exclude_products.length > 0) query.whereNotIn("products.id", Array.isArray(exclude_products) ? exclude_products : [exclude_products])
          if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
          if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
          if (name && name.length) query.whereILike('products.name', `%${name}%`)
        })
    )[0].count
  }

  async getAll(
    filters: IGetProductsQuery,
    sorts: IDefaultQuery
  ): Promise<IProduct[]> {
    const { limit, offset, order, orderBy } = sorts
    const { categories, exclude_products, name, ...otherFilters } = filters

    return await KnexService("products")
      .select([
        'products.id',
        'products.name',
        'products.slug',
        'products.price',
        'products.brand',
        'products.has_delivery',
        'products.discount_percent',
        'products.discount_until',
        'products.created_at',
        'product_images.src as cover',
        'categories.id as category.id',
        'categories.name as category.name',
        'categories.parent_id as category.parent_id',
        'parent_name as category.parent_name',
      ])
      .leftJoin(function () {
        this.select([
          "categories.id",
          "categories.name",
          "categories.parent_id",
          "parent.name as parent_name"
        ])
          .leftJoin({ parent: "categories" }, { "categories.parent_id": "parent.id" })
          .from("categories")
          .as("categories")
          .groupBy("categories.id", "parent.id")
      }, { "products.category_id": "categories.id" })
      .innerJoin(function () {
        this.select([
          'product_images.product_id',
          'product_images.src'
        ])
          .from('product_images')
          .as('product_images')
          .where('product_images.is_cover', '=', true)
      }, { 'products.id': 'product_images.product_id' })
      .limit(limit)
      .offset(offset)
      .where({ 'products.is_deleted': otherFilters.is_deleted || false })
      .modify((query) => {
        if (orderBy) {
          query.orderBy(`products.${orderBy}`, order)
        }
        if (exclude_products && exclude_products.length > 0) query.whereNotIn("products.id", Array.isArray(exclude_products) ? exclude_products : [exclude_products])
        if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
        if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
        if (name && name.length) query.whereILike('products.name', `%${name}%`)
      })
      .groupBy(
        'products.id',
        'product_images.src',
        'categories.id',
        'categories.name',
        'categories.parent_id',
        'categories.parent_name'
      )
  }

  async getForCart(
    filters,
    sorts: IDefaultQuery
  ): Promise<IProduct[]> {
    const { limit, offset, order, orderBy } = sorts
    const { in: IN } = filters

    return await KnexService("products")
      .select([
        'products.id',
        'products.name',
        'products.slug',
        'products.price',
        'products.brand',
        'products.discount_percent',
        'products.discount_until',
        'product_images.src as cover',
      ])
      .innerJoin(function () {
        this.select([
          'product_images.product_id',
          'product_images.src',
        ])
          .from('product_images')
          .as('product_images')
          .where('product_images.is_cover', '=', true)
      }, { 'products.id': 'product_images.priduct_id' })
      .limit(limit)
      .offset(offset)
      .where({ 'products.is_deleted': false })
      .modify((query) => {
        if (orderBy) query.orderBy(`products.${orderBy}`, order);
        if (IN && IN.length > 0) query.whereIn("products.id", Array.isArray(IN) ? IN : [IN])
      })
      .groupBy(
        'products.id',
        'product_images.src'
      )
  }

  async getByIdOrSlug(identifier: string): Promise<IProduct> {
    return getFirst(
      await KnexService('products')
        .select([
          'products.*',
          'categories.id as category.id',
          'categories.name as category.name',
          'categories.parent_id as category.parent_id',
          'parent_name as category.parent_name',

          'product_images.src as cover',

          KnexService.raw(`
            (select json_agg(
              json_build_object(
                'id', "product_images"."id",
                'is_cover', "product_images"."is_cover",
                'index', "product_images"."index",
                'product_id', "product_images"."product_id",
                'image_src', "product_images"."src"
              )
              order by "product_images"."index" asc
            )
            from "product_images"
            where "product_images"."product_id" = "products"."id" and "is_cover" = false
            ) as images
          `),

        ])
        .leftJoin(function () {
          this.select([
            "categories.id",
            "categories.name",
            "categories.parent_id",
            "parent.name as parent_name"
          ])
            .leftJoin({ parent: "categories" }, { "categories.parent_id": "parent.id" })
            .from("categories")
            .as("categories")
            .groupBy("categories.id", "parent.id")
        }, { "products.category_id": "categories.id" })
        .innerJoin(function () {
          this.select([
            'product_images.product_id',
            'product_images.src'
          ])
            .from('product_images')
            .as('product_images')
            .where('product_images.is_cover', '=', true)
        }, { 'products.id': 'product_images.product_id' })
        .groupBy(
          'products.id',
          'categories.id',
          'categories.name',
          'categories.parent_id',
          'categories.parent_name',
          'product_images.src'
        )

        .where({
          [`products.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier,
          'products.is_deleted': false
        })
    )
  }

  async getByIdOrSlug_min(identifier: string): Promise<IProduct> {
    return getFirst(
      await KnexService('products')
        .select('products.*')
        .where({
          [`products.${isUUID(identifier) ? 'id' : 'slug'}`]: identifier,
          'products.is_deleted': false
        })
    )
  }

  async getSimilarSlugs(slug: string): Promise<IProduct[]> {
    return await KnexService('products')
      .select(['slug'])
      .whereILike('slug', `${slug}%`)
      .where({ is_deleted: false })
  }

  async getByIdMinimal(product_id: string) {
    return getFirst(
      await KnexService('products')
        .select('*')
        .where({ id: product_id, is_deleted: false })
    )
  }

  async deleteById(product_id: string): Promise<void> {
    await KnexService('products')
      .where({ id: product_id, is_deleted: false })
      .update({ is_deleted: true });
  }
}