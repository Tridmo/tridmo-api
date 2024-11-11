import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

      create table if not exists orderers (
        id uuid primary key default uuid_generate_v4(),
        phone VARCHAR(48) not null,
        full_name varchar(64) not null,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

        create table if not exists orders (
            id uuid primary key default uuid_generate_v4(),
            orderer_id uuid references orderers(id) on delete cascade not null not null,
            total_cost_amount decimal(10,2) not null default(0),
            status int not null default 1,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );

        create table if not exists order_items (
            id uuid primary key default uuid_generate_v4(),
            model_id uuid references models(id) not null,
            order_id uuid references orders(id) not null,
            cost_amount decimal(10,2) not null default(0),
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists order_items;
        drop table if exists orders;
        drop table if exists orderers;
    `)
}
