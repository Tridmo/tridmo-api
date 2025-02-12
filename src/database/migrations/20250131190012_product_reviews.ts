import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
        create table if not exists product_reviews(
            id uuid primary key default gen_random_uuid(),
            product_id uuid REFERENCES products(id) ON DELETE CASCADE not null,
            reviewer_name varchar(128),
            comment text,
            rating int not null,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists product_reviews;
    `);
}

