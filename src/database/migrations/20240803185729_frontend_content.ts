import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS frontend_content_types (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS frontend_content_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      type_id UUID REFERENCES frontend_content_types(id) ON DELETE CASCADE NOT NULL,
      url VARCHAR(255),
      position INT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS frontend_page_sections (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS frontend_section_content (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      section_id UUID REFERENCES frontend_page_sections(id) ON DELETE CASCADE NOT NULL,
      content_item_id UUID REFERENCES frontend_content_items(id) ON DELETE CASCADE NOT NULL
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS frontend_section_content;
    DROP TABLE IF EXISTS frontend_page_sections;
    DROP TABLE IF EXISTS frontend_content_items;
    DROP TABLE IF EXISTS frontend_content_types;
  `);
}
