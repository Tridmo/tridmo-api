import KnexService from '../../../database/connection';
import { getFirst } from "../../shared/utils/utils";
import { ICreateOrder, ICreateOrderer, IOrderer, IUpdateOrder } from "../interface/orders.interface";

export default class OrdersDAO {
  async create({ total_cost_amount, orderer_id }: ICreateOrder) {
    return getFirst(
      await KnexService('orders')
        .insert({
          total_cost_amount,
          orderer_id
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

  async createOrderer({ phone, full_name }: ICreateOrderer) {
    return getFirst(
      await KnexService('orderers')
        .insert({
          phone, full_name
        })
        .returning("*")
    )
  }

  async getOrderer({ phone }): Promise<IOrderer> {
    return await KnexService('orderers')
      .select("*")
      .where({ phone })
      .first()
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
          'models.id as model.id',
          'models.name as model.name',
          'models.slug as model.slug',
          'cover as model.cover'
        ])
          .from('order_items')
          .as('order_items')
          .leftJoin(function () {
            this.select([
              'models.id',
              'models.name',
              'models.slug',
              KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .leftJoin(function () {
                this.select([
                  'model_images.model_id',
                  "image.src as image.src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'models.id': 'model_images.model_id' })
              .from('models')
              .as('models')
              .groupBy("models.id")
          }, { 'order_items.model_id': 'models.id' })
          .groupBy('order_items.id', 'models.id', 'models.name', 'models.cover')
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
          'models.id as model_id',
          'models.description as model_description',
          'models.name as product_title',
          'models.slug as product_slug',
          'cover as cover_image',
          'file_src as file_src',
        ])
          .from('order_items')
          .as('order_items')

          .leftJoin(function () {
            this.select([
              'models.id',
              'models.name',
              'models.slug',
              'models.description',
              'image_src as cover',
              'file.src as file_src',
            ])
              .leftJoin(function () {
                this.select([
                  'model_images.model_id',
                  "image.src as image_src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .innerJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'models.id': 'model_images.model_id' })
              .leftJoin({ file: "files" }, { "models.file_id": "file.id" })
              .from('models')
              .as('models')
              .groupBy("models.id", 'image_src', 'file.src')
          }, { 'order_items.model_id': 'models.id' })
          .groupBy('order_items.id', 'models.id', 'models.name', 'models.slug', 'models.cover', 'models.description', 'models.file_src')
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
          'models.id as model.id',
          'models.name as model.name',
          'models.slug as model.slug',
          'cover as model.cover',
        ])
          .from('order_items')
          .as('order_items')
          .leftJoin(function () {
            this.select([
              'models.id',
              'models.name',
              'models.slug',
              KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .leftJoin(function () {
                this.select([
                  'model_images.model_id',
                  "image.src as image.src"
                ])
                  .from('model_images')
                  .where({ is_main: true })
                  .leftJoin({ image: "images" }, { 'model_images.image_id': 'image.id' })
                  .groupBy('model_images.id', "image.id")
                  .as('model_images')
              }, { 'models.id': 'model_images.model_id' })
              .from('models')
              .as('models')
              .groupBy("models.id")
          }, { 'order_items.model_id': 'models.id' })
          .groupBy('order_items.id', 'models.id', 'models.name', 'models.slug', 'models.slug', 'models.cover')
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