import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE brands
    ADD COLUMN country_id UUID REFERENCES countries(id);
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE brands
    DROP COLUMN country_id;
  `);
}

