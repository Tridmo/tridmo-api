import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("categories").count("id");
  if (Number(count[0]?.count)) return

  await knex("categories").insert([
    { type: 'interior', name: 'Спальня' },
    { type: 'interior', name: 'Гостиная' },
    { type: 'interior', name: 'Детская комната' },
    { type: 'interior', name: 'Кухня' },
    { type: 'interior', name: 'Столовая' },
    { type: 'interior', name: 'Ванная комната' },
    { type: 'interior', name: 'Зал' },
    { type: 'interior', name: 'Прихожая' },
    { type: 'interior', name: 'Ресторан' },
    { type: 'interior', name: 'Офис' },
  ]);
  //   const created: ICategory = getFirst(
  //     await knex("categories").insert({
  //       name: cat.name,
  //       type: cat.type
  //     }).returning("*")
  //   )

  //   for (const c of cat.children) {
  //     await knex("categories").insert({
  //       name: c.name,
  //       parent_id: created.id,
  //       type: c.type
  //     })
  //   }
  // };
};
