import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists interior_images (
            id uuid primary key default uuid_generate_v4(),
            image_id uuid references images(id) on delete cascade not null,
            interior_id uuid references interiors(id) on delete cascade not null,
            is_main bool not null default false,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists interior_images;
    `)
}

