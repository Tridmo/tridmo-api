import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    const count = await knex("roles").count("id");
    if (Number(count[0]?.count)) return
    await knex("roles").del();

    // Inserts seed entries
    await knex("roles").insert([
        { id: 1, name: 'admin', description: "Super" },
        { id: 2, name: 'brand', description: "Brand" },
        { id: 3, name: 'designer', description: "Designer" },
    ]);
};