import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('models', function (table) {
    table.index('availability', 'idx_availability');
    table.index('top', 'idx_top');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('models', function (table) {
    table.dropIndex('availability', 'idx_availability');
    table.dropIndex('top', 'idx_top');
  });
}

