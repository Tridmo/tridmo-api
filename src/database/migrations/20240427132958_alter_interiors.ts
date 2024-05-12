import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  alter table interiors alter column style_id drop not null;
    `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``)
}

