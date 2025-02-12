import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists model_materials (
            id uuid primary key default uuid_generate_v4(),
            model_id uuid references models(id) on delete cascade not null,
            material_id int references materials(id) on delete cascade not null,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp,
            CONSTRAINT model_material_unique UNIQUE (model_id, material_id)
        );
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists model_materials;
    `);
}

