import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    const count = await knex("materials").count("id");
    if (Number(count[0]?.count)) return
    await knex("materials").del();

    // Inserts seed entries
    await knex("materials").insert([
        { name: "Brick" },
        { name: "Concrete" },
        { name: "Fabric" },
        { name: "Fur" },
        { name: "Glass" },
        { name: "Gypsum" },
        { name: "Leather" },
        { name: "Liquid" },
        { name: "Metal" },
        { name: "Organics" },
        { name: "Paper" },
        { name: "Plastic" },
        { name: "Rattan" },
        { name: "Stone" },
        { name: "Wood" }
    ]);
};
