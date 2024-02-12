import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {

	await knex.raw(`
		create table if not exists categories(
			id serial not null primary key,
			parent_id int references categories(id),
			type varchar,
			name varchar(64) not null,
			description text,
			created_at timestamp with time zone not null default current_timestamp,
            updated_at timestamp with time zone not null default current_timestamp
		);
 	`);

}


export async function down(knex: Knex): Promise<void> {
	await knex.raw(`
    	drop table if exists categories;
  	`);
}

