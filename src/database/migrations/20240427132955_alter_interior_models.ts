import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table interior_models 
          add column interior_image_id uuid REFERENCES interior_images(id) on delete cascade not null,
          add column x DECIMAL(10, 6) NOT NULL,
          add column y DECIMAL(10, 6) NOT NULL,
          add column text VARCHAR(255);
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table interior_models drop column interior_image_id, drop column x, drop column y, drop column text;
    `)
}

