import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table profiles drop column birth_date;
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table profiles add column birth_date DATE;
  `)
}

