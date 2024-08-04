import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table model_images add column index int not null default(1);
    alter table model_images alter column index drop default;
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter table model_images drop column index;
  `)
}

