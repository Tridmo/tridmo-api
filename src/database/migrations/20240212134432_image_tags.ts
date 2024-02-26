import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE image_tags (
            id uuid primary key default uuid_generate_v4(),
            image_id uuid REFERENCES images(id) on delete cascade not null,
            x INT NOT NULL,
            y INT NOT NULL,
            text VARCHAR(255) NOT NULL
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        drop table if exists image_tags;
    `)
}

