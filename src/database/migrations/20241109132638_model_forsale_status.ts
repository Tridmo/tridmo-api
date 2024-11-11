import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table models add column for_sale boolean default(false) not null;
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table models drop column for_sale;
  `)
}

