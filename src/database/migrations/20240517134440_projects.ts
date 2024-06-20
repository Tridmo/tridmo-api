import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
        create table if not exists projects (
            id uuid primary key default uuid_generate_v4(),
            user_id uuid references profiles(id) on delete cascade not null,
            name varchar(255) not null,
            created_at timestamp with time zone not null default current_timestamp
        );
        create table if not exists project_models (
            id uuid primary key default uuid_generate_v4(),
            project_id uuid references projects(id) on delete cascade not null,
            model_id uuid references models(id) on delete cascade not null,
            created_at timestamp with time zone not null default current_timestamp
        );

        create index if not exists projects_userId_index on projects(user_id);
        create index if not exists project_models_projectId_index on project_models(project_id);
        create index if not exists project_models_modelId_index on project_models(model_id);
        create index if not exists project_models_projectIdmodelId_index on project_models(project_id, model_id);
  `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        drop table if exists projects;
        drop table if exists project_models;
        drop index if exists projects_userId_index;
    `);
}

