import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  const contentTypeCount = await knex("frontend_content_types").count("id as count");
  const sectionsCount = await knex("frontend_page_sections").count("id as count");

  if (!Number(contentTypeCount[0]?.count)) {
    await knex("frontend_content_types").del();
    await knex("frontend_content_types").insert([
      { name: 'designer_profile_image' },
      { name: 'brand_logo_image' },
    ]);

  };
  if (!Number(sectionsCount[0]?.count)) {
    await knex("frontend_page_sections").del();
    await knex("frontend_page_sections").insert([
      { name: 'designer_profiles' },
      { name: 'brand_logos' },
    ]);
  };

}
