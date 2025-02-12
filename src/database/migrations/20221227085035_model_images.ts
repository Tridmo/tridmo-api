import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists model_images (
            id uuid primary key default uuid_generate_v4(),
            image_id uuid references images(id) on delete cascade not null,
            model_id uuid references models(id) on delete cascade not null,
            is_main bool not null default false,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists model_images;
    `)
}

