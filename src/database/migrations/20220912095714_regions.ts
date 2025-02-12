import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists regions (
            id int primary key,
            name varchar(128) not null
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists regions;
    `)
}

