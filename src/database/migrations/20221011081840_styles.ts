import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists style_types (
            id serial not null primary key,
            name varchar(64) not null
        );

        create table if not exists styles (
            id serial not null primary key,
            name varchar(1024) not null,
            type int references style_types(id) not null,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists styles;
    `);
}