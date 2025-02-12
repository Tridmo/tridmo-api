import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists comments ( 
            id uuid primary key default uuid_generate_v4(), 
            user_id uuid references profiles(id) on delete cascade not null,
            parent_id uuid references comments(id) on delete cascade,
            entity_id uuid not null,
            entity_source varchar(32), 
            text varchar(2048) not null,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists comments;
    `)
}
