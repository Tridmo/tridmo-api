import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table profiles add column company_name varchar(128) not null default('Company');
        alter table profiles alter column company_name drop default;
    `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table profiles drop column company_name;
    `)
}

