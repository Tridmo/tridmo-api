import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const count = await knex("notification_actions").count("id");
  if (Number(count[0]?.count)) return
  await knex("notification_actions").del();

  // Inserts seed entries
  await knex("notification_actions").insert([
    { id: "new_model_download" },
    { id: "new_model_upload" },
    { id: "new_interior_upload" },
    { id: "new__tag" },
    { id: "new_model_comment" },
    { id: "new_interior_comment" },
    { id: "new_model_like" },
    { id: "new_interior_like" },
    { id: "new_comment_like" },
    { id: "new_message" },
    { id: "banned" },
  ]);
};
