import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        create table if not exists images (
            id uuid primary key default uuid_generate_v4(),
            name varchar(1024) not null,
            src varchar not null,
            size bigint not null,
            ext varchar(16) not null,
            mimetype varchar not null,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists images;
    `)
}

