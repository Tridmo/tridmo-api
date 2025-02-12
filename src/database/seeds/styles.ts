import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("styles").count("id");
  if (Number(count[0]?.count)) return
  await knex("styles").del();

  // Inserts seed entries
  await knex("styles").insert([
    { type: 1, name: "Классический" },
    { type: 1, name: "Современный" },
    { type: 1, name: "Этнический" }
  ]);
};
