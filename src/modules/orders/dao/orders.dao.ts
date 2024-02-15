import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateOrder, IUpdateOrder } from "../interface/orders.interface";

export default class OrdersDAO {
  async create({ total_cost_amount, user_id }: ICreateOrder) {
    return getFirst(
      await KnexService('orders')
        .insert({
          total_cost_amount,
          user_id
        })
        .returning("*")
    )
  }

  async update(id: string, values: IUpdateOrder) {
    return getFirst(
      await KnexService('orders')
        .where({ id: id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async getByStatus(status: number) {
    return await KnexService('orders')
      .select([
        "orders.id",
        "orders.total_cost_amount",
        "orders.created_at",
        KnexService.raw(`jsonb_agg(distinct "order_items") as items`)
      ])
      .leftJoin(function () {
        this.select([
          'order_items.id',
          'order_items.order_id',
          'order_items.cost_amount',
          'products.id as product.id',
          'products.title as product.title',
          'products.slug as product.slug',
          'cover as product.cover'
        ])
          .from('order_items')
          .as('order_items')
          .leftJoin(function () {
            this.select([
              'products.id',
              'products.title',
              'products.slug',
              KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .leftJoin(function () {
                this.select([
                  'model_images.product_id',
                  "image.src as image.src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'products.id': 'model_images.product_id' })
              .from('products')
              .as('products')
              .groupBy("products.id")
          }, { 'order_items.product_id': 'products.id' })
          .groupBy('order_items.id', 'products.id', 'products.title', 'products.cover')
      }, { 'orders.id': 'order_items.order_id' })
      .where({ status })
      .orderBy("created_at", "desc")
      .groupBy("orders.id")

  }

  async getByUserId(user_id: string) {
    return await KnexService('orders')
      .select([
        "orders.id",
        "orders.user_id",
        "orders.total_cost_amount",
        "orders.created_at",
        KnexService.raw(`jsonb_agg(distinct "order_items") as items`)
      ])
      .leftJoin(function () {
        this.select([
          'order_items.id',
          'order_items.order_id',
          'order_items.cost_amount',
          'products.id as product_id',
          'products.description as product_description',
          'products.title as product_title',
          'products.slug as product_slug',
          'cover as cover_image',
          'file_src as file_src',
          'model_id as model_id',
          'interior_id as interior_id'
        ])
          .from('order_items')
          .as('order_items')

          .leftJoin(function () {
            this.select([
              'products.id',
              'products.title',
              'products.slug',
              'products.description',
              'image_src as cover',
              'file.src as file_src',
              'model.id as model_id',
              'interior.id as interior_id',
              // KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .leftJoin(function () {
                this.select([
                  'model_images.product_id',
                  "image.src as image_src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .innerJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'products.id': 'model_images.product_id' })
              .leftJoin({ file: "files" }, { "products.file_id": "file.id" })
              .leftJoin({ model: "models" }, { "products.id": "model.product_id" })
              .leftJoin({ interior: "interiors" }, { "products.id": "interior.product_id" })
              .from('products')
              .as('products')
              .groupBy("products.id", 'image_src', 'file.src', 'model.id', 'interior.id')
          }, { 'order_items.product_id': 'products.id' })
          .groupBy('order_items.id', 'products.id', 'products.title', 'products.slug', 'products.cover', 'products.description', 'products.file_src', 'products.model_id', 'products.interior_id')
      }, { 'orders.id': 'order_items.order_id' })
      .where({
        'orders.user_id': user_id,
        'orders.status': 2
      })
      .orderBy("created_at", "desc")
      .groupBy("orders.id")

  }


  async getByUserAndStatus(user_id: string, status: number) {
    return await KnexService('orders')
      .select([
        "orders.id",
        "orders.total_cost_amount",
        "orders.created_at",
        KnexService.raw(`jsonb_agg(distinct "order_items") as items`)
      ])
      .leftJoin(function () {
        this.select([
          'order_items.id',
          'order_items.order_id',
          KnexService.raw(`cast (order_items.cost_amount as decimal(10,2))`),
          'products.id as product.id',
          'products.title as product.title',
          'products.slug as product.slug',
          'style_name as product.style.name',
          'model_id as product.model_id',
          'interior_id as product.interior_id',
          'cover as product.cover',
        ])
          .from('order_items')
          .as('order_items')
          .leftJoin(function () {
            this.select([
              'products.id',
              'products.title',
              'products.slug',
              'model.id as model_id',
              'interior.id as interior_id',
              'style.name as style_name',
              KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .leftJoin({ style: "styles" }, { "products.style_id": "style.id" })
              .leftJoin({ model: "models" }, { "model.product_id": "products.id" })
              .leftJoin({ interior: "interiors" }, { "interior.product_id": "products.id" })
              .leftJoin(function () {
                this.select([
                  'model_images.product_id',
                  "image.src as image.src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'products.id': 'model_images.product_id' })

              .from('products')
              .as('products')
              .groupBy("products.id", 'style.name', 'model.id', 'interior.id')
          }, { 'order_items.product_id': 'products.id' })
          .groupBy('order_items.id', 'products.id', 'products.title', 'products.slug', 'products.slug', 'products.cover', 'products.style_name', 'products.model_id', 'products.interior_id')
      }, { 'orders.id': 'order_items.order_id' })
      .where({ user_id, status })
      .orderBy("created_at", "desc")
      .groupBy("orders.id")

  }

  async getActiveByUser(user_id: string) {
    return getFirst(
      await KnexService('orders')
        .select('*')
        .where({ user_id, status: 1 })
    )

  }

  async getById(id: string) {
    return getFirst(
      await KnexService('orders')
        .where({ id: id })
    )
  }

  async deleteById(id: string) {
    return await KnexService('orders')
      .where({ id: id })
      .delete()
  }


}