import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists notifications (
            id uuid primary key default uuid_generate_v4(),
            action_id varchar references notification_actions(id) on delete cascade not null,
            model_id uuid references models(id) on delete cascade,
            interior_id uuid references interiors(id) on delete cascade,
            notifier_id uuid references profiles(id) on delete cascade not null,
            recipient_id uuid references profiles(id) on delete cascade not null,
            message varchar(64),
            seen boolean not null default false,
            created_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists notifications;
    `)
}

