import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("materials").count("id");
  if (Number(count[0]?.count)) return
  await knex("materials").del();

  // Inserts seed entries
  await knex("materials").insert([
    { name: "Кирпич" },
    { name: "Бетон" },
    { name: "Ткань" },
    { name: "Шерсть" },
    { name: "Стекло" },
    { name: "Гипс" },
    { name: "Кожа" },
    { name: "Жидкость" },
    { name: "Металл" },
    { name: "Органика" },
    { name: "Бумага" },
    { name: "Пластик" },
    { name: "Ротанг" },
    { name: "Камень" },
    { name: "Дерево" }
  ]);
};
