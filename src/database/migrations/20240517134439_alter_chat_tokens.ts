import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE chat_tokens
      ALTER COLUMN token TYPE VARCHAR,
      ALTER COLUMN token SET NOT NULL;
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE chat_tokens
      ALTER COLUMN token DROP NOT NULL;
    `)
}
