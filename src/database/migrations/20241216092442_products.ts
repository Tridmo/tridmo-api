import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
    create table if not exists products(
      id uuid primary key default gen_random_uuid(),
      category_id int references categories(id) not null,
      name varchar(1024) not null,
      description text not null,
      brand varchar(256),
      slug varchar(256) unique,
      has_delivery boolean default false,
      price decimal(10,2) not null,
      discount_percent int,
      discount_until TIMESTAMP WITH TIME ZONE,
      length int,
      height int,
      width int,
      colors varchar(8)[],
      materials varchar(24)[],
      is_deleted bool not null default false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists products;
  `);
}

