import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table profiles add column instagram VARCHAR(256);
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table profiles drop column instagram;
  `)
}

