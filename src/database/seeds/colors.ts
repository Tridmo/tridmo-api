import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("colors").count("id");
  if (Number(count[0]?.count)) return
  await knex("colors").del();

  // Inserts seed entries
  await knex("colors").insert([
    { name: "Чёрный", hex_value: "#000000" },
    { name: "Белый", hex_value: "#ffffff" },
    { name: "Серый", hex_value: "#808080" },
    { name: "Коричневый", hex_value: "#783c00" },
    { name: "Красный", hex_value: "#c00000" },
    { name: "Оранжевый", hex_value: "#ff9000" },
    { name: "Жёлтый", hex_value: "#ffd401" },
    { name: "Бежевый", hex_value: "#ead6bd" },
    { name: "Розовый", hex_value: "#ffcada" },
    { name: "Фиолетовый", hex_value: "#c400aa" },
    { name: "Фиолетовый", hex_value: "#5a009d" },
    { name: "Синий", hex_value: "#2650da" },
    { name: "Светло-голубой", hex_value: "#61c3ff" },
    { name: "Циан", hex_value: "#22f6f8" },
    { name: "Зелёный", hex_value: "#336601" },
    { name: "Светло-зелёный", hex_value: "#77e705" }
  ]);
};
