import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists brands (
            id uuid primary key default uuid_generate_v4(),
            name varchar(1024) not null,
            slug varchar(64) unique not null,
            description text,
            site_link varchar(1024) not null,
            phone VARCHAR(48),
            email VARCHAR(256),
            address VARCHAR(256),
            image_id uuid references images(id) on delete no action,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists brands;
    `);
}