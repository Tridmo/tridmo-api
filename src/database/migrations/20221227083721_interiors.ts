import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table if not exists interiors (
            id uuid primary key default uuid_generate_v4(),
            category_id int references categories(id) not null,
            title varchar(1024) not null,
            description text not null,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists interiors;
    `)
}

