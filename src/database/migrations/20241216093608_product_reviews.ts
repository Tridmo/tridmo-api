import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

    await knex.raw(`
        create table if not exists product_reviews(
            id uuid primary key default uuid_generate_v4(),
            user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
            reviewer_name varchar(128),
            comment text(2000),
            rating int not null,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table product_reviews;
    `);
}

