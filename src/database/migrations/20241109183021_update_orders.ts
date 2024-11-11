import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.schema.alterTable('orderers', t => {
    t.unique('phone', { useConstraint: false })
  })
  await knex.schema.alterTable('orders', t => {
    t.index(['orderer_id', 'status'])
  })
  await knex.schema.alterTable('order_items', t => {
    t.unique(['order_id', 'model_id'], { useConstraint: false })
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orderers', t => {
    t.dropUnique(['phone'])
  })
  await knex.schema.alterTable('orders', t => {
    t.dropIndex(['orderer_id', 'status'])
  })
  await knex.schema.alterTable('order_items', t => {
    t.dropUnique(['order_id', 'model_id'])
  })
}

