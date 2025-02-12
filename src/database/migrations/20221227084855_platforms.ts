import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create table if not exists platforms ( 
        id uuid primary key default uuid_generate_v4(),
        name varchar(256) not null,
        type int not null
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists platforms;
    `)
}