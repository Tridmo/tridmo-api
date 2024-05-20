import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists chat_tokens ( 
            id uuid primary key default uuid_generate_v4(), 
            user_id uuid references profiles(id) on delete cascade not null,
            token varchar(128),
            created_at timestamp with time zone not null default current_timestamp
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists chat_tokens;
    `)
}
