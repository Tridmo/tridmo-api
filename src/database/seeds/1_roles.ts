import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  await knex("roles").insert([
    { id: 1, name: 'admin', description: "Super" },
    { id: 2, name: 'brand', description: "Brand" },
    { id: 3, name: 'designer', description: "Designer" },
  ])
    .onConflict('name')
    .ignore();
};