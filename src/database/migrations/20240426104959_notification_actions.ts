import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists notification_actions (
            id varchar(48) primary key,
            description varchar(64)
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists notification_actions;
    `)
}

