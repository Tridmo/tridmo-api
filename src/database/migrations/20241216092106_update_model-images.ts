import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table model_images add column type varchar(16) not null default('image');
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table model_images drop column type;
    `)
}

