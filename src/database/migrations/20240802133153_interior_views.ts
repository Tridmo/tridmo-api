import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists interior_views (
            id uuid primary key default gen_random_uuid(),
            interior_id uuid references interiors(id) on delete cascade not null,
            user_id uuid references profiles(id) on delete no action,
            ip_address varchar(256),
            client_agent text,
            created_at timestamp with time zone not null default current_timestamp
        );
        CREATE UNIQUE INDEX unique_registered_user_views 
        ON interior_views (interior_id, user_id) 
        WHERE user_id IS NOT NULL;

        CREATE UNIQUE INDEX unique_unregistered_user_views 
        ON interior_views (interior_id, ip_address, client_agent) 
        WHERE user_id IS NULL;

    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP INDEX IF EXISTS unique_registered_user_views;
        DROP INDEX IF EXISTS unique_unregistered_user_views;
        drop table if exists interior_views;
    `)
}

