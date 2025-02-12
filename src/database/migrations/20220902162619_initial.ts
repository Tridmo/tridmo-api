import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

  await knex.schema.raw(`
    create extension if not exists "uuid-ossp";
  `);

  // await knex.raw(`
  //   create table if not exists languages(
  //     language_id serial not null primary key,
  //     name varchar(32) not null,
  //     short_name varchar(6) not null,
  //     flag varchar(12) not null,
  //     code varchar(6) not null
  //   );
  // `);

  await knex.raw(`
    create table if not exists profiles(
      id uuid primary key default uuid_generate_v4(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE not null,
      image_src varchar(64),
      full_name varchar(64) not null,
      username varchar(64) unique not null,
      email VARCHAR(256) unique NOT NULL,
      company_name varchar(128) not null,
      phone VARCHAR(48),
      telegram VARCHAR(256),
      linkedin VARCHAR(256),
      portfolio_link VARCHAR(256),
      address VARCHAR(256),
      birth_date DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    drop table if exists profiles;
  `);
}

