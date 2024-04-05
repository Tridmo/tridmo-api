import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    const count = await knex("platforms").count("id");
    if (Number(count[0]?.count)) return
    await knex("platforms").del();

    // Inserts seed entries
    await knex("platforms").insert([
        { type: 1, name: "3Ds max" },
        { type: 1, name: "Blender" },
        { type: 1, name: "Cinema 4D" },

        { type: 2, name: "Corona" },
        { type: 2, name: "Blender" },
        { type: 2, name: "V-Ray" }
    ]);
};
