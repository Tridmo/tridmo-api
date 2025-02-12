import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

      create table if not exists orderers (
        id uuid primary key default gen_random_uuid(),
        phone VARCHAR(48) unique not null,
        full_name varchar(64) not null,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

        create table if not exists orders (
            id uuid primary key default gen_random_uuid(),
            orderer_id uuid references orderers(id) on delete cascade not null,
            status int not null default 1,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );

        create table if not exists order_items (
            id uuid primary key default gen_random_uuid(),
            product_id uuid references products(id) not null,
            order_id uuid references orders(id) not null,
            cost_amount decimal(10,2) not null,
            quantity int not null default 1,
            color varchar(8),
            material varchar(24),
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
  `);
  await knex.schema.alterTable('orders', t => {
    t.index(['orderer_id', 'status'])
  })
  await knex.schema.alterTable('order_items', t => {
    t.unique(['order_id', 'product_id'], { useConstraint: false })
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists order_items;
        drop table if exists orders;
        drop table if exists orderers;
    `);
}
