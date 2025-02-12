import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("style_types").count("id");
  if (Number(count[0]?.count)) return
  await knex("style_types").del();

  // Inserts seed entries
  await knex("style_types").insert([
    { name: "model" },
    { name: "interior" }
  ]);
};
