import { type Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists interiors (
            id uuid primary key default uuid_generate_v4(),
            user_id uuid references profiles(id) on delete cascade not null,
            render_platform_id uuid references platforms(id) on delete no action,
            interaction_id uuid references interactions(id) on delete cascade not null,
            style_id int references styles(id) on delete no action,
            category_id int references categories(id) on delete no action not null,
            status int not null default(0),
            name varchar(1024) not null,
            description text not null,
            slug varchar(256) not null,
            is_deleted bool not null default false,
            created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
        );
    `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists interiors;
    `)
}

