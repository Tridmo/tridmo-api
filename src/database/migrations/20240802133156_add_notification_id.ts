import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table if exists interior_likes add column notification_id uuid;
        alter table if exists comment_likes add column notification_id uuid;
        alter table if exists comments add column notification_id uuid;
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        alter table if exists interior_likes drop column notification_id;
        alter table if exists comment_likes drop column notification_id;
        alter table if exists comments drop column notification_id;
    `)
}

