import { categoriesData } from "../catsData";
import { Knex } from "knex";
import { ICategory } from "../../modules/categories/interface/categories.interface";
import { getFirst } from "../../modules/shared/utils/utils";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    const count = await knex("categories").count("id");
    if (Number(count[0]?.count)) return

    // Inserts seed entries
    for (const cat of categoriesData) {
        const created: ICategory = getFirst(
            await knex("categories").insert({
                name: cat.name,
                type: cat.type
            }).returning("*")
        )

        for (const c of cat.children) {
            await knex("categories").insert({
                name: c.name,
                parent_id: created.id,
                type: c.type
            })
        }
    };
};
