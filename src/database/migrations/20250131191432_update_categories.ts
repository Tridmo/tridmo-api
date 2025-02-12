import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table categories add column image varchar;
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table categories drop column image;
    `)
}

