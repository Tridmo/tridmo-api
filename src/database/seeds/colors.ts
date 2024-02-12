import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    const count = await knex("colors").count("id");
    if (Number(count[0]?.count)) return
    await knex("colors").del();

    // Inserts seed entries
    await knex("colors").insert([
        { name: "Black", hex_value: "#000000" },
        { name: "White", hex_value: "#ffffff" },
        { name: "Gray", hex_value: "#808080" },
        { name: "Brown", hex_value: "#783c00" },
        { name: "Red", hex_value: "#c00000" },
        { name: "Orange", hex_value: "#ff9000" },
        { name: "Yellow", hex_value: "#ffd401" },
        { name: "Beige", hex_value: "#ead6bd" },
        { name: "Pink", hex_value: "#ffcada" },
        { name: "Purple", hex_value: "#c400aa" },
        { name: "Violet", hex_value: "#5a009d" },
        { name: "Blue", hex_value: "#2650da" },
        { name: "Light blue", hex_value: "#61c3ff" },
        { name: "Cyan", hex_value: "#22f6f8" },
        { name: "Green", hex_value: "#336601" },
        { name: "Light green", hex_value: "#77e705" }
    ]);
};
