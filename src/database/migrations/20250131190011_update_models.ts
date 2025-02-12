import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table models add column product_id uuid references products(id) ON DELETE SET NULL;
`)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table models drop column product_id;
`)
}

