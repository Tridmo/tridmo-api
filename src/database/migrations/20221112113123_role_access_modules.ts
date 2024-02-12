import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
    create table if not exists role_access_modules ( 
        id serial primary key not null, 
        access_module_id int references access_modules(id) on delete cascade not null,
        role_id int references roles(id) on delete cascade not null,
        created_at timestamp with time zone not null default current_timestamp,
        updated_at timestamp with time zone not null default current_timestamp
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists role_access_modules;
    `)
}
