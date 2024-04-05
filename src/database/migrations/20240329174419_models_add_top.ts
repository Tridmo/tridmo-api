import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table models add column top bool not null default false;
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table models drop column top;
    `)
}

