import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists product_images (
            id uuid primary key default gen_random_uuid(),
            product_id uuid references products(id) on delete cascade not null,
            src varchar not null,
            is_cover bool not null default false,
            index int not null default 1,
            type varchar(24) default 'image'
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists product_images;
    `)
}

