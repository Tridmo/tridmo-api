import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table brands add column slug varchar(64) unique not null default 'brandslug';
        alter table brands alter column slug drop default;
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table brands drop column slug;
    `)
}

