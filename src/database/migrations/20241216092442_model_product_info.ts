import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
    create table if not exists model_product_info(
      id uuid primary key default uuid_generate_v4(),
      model_id uuid REFERENCES models(id) ON DELETE CASCADE not null,
      has_delivery boolean default false,
      price int not null,
      discount_percent int,
      discount_until TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table model_product_info;
  `);
}

