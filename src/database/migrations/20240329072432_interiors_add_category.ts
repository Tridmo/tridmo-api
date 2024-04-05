import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table interiors add column category_id int references categories(id) on delete no action not null;
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        alter table interiors drop column category_id;
    `)
}

