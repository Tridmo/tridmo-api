import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
    create table if not exists access_modules ( 
        id int primary key not null,  
        name varchar(120) not null,
        created_at timestamp with time zone not null default current_timestamp,
        updated_at timestamp with time zone not null default current_timestamp
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists access_modules;
    `)
}
