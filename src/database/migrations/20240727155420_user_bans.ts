import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
    create table if not exists user_bans(
      id uuid primary key default uuid_generate_v4(),
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE not null,
      reason varchar,
      permanent boolean default false,
      until TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table user_bans;
  `);
}

