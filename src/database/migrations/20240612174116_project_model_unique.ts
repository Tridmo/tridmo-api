import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE project_models ADD CONSTRAINT project_model_unique UNIQUE (project_id, model_id);
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
      ALTER TABLE project_models DROP CONSTRAINT project_model_unique;
    `)
}
