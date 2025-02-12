import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create table if not exists interactions ( 
        id uuid primary key default uuid_generate_v4(), 
        views int default 0,
        likes int default 0,
        saves int default 0
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists interactions;
    `)
}
