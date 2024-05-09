import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table interiors add column status int not null default(0);
    `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table interiors drop column status;
    `)
}

