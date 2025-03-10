import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    CREATE TABLE IF NOT EXISTS websites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      domain VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS frontend_content_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL UNIQUE,
      display_name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS frontend_page_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      website_id UUID REFERENCES websites(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL UNIQUE,
      display_name VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS frontend_content_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
      type_id UUID REFERENCES frontend_content_types(id) ON DELETE CASCADE NOT NULL,
      section_id UUID REFERENCES frontend_page_sections(id) ON DELETE CASCADE NOT NULL,
      url VARCHAR(255),
      title VARCHAR(255),
      primary_text VARCHAR(255),
      secondary_text VARCHAR(255),
      desktop_image VARCHAR(255),
      tablet_image VARCHAR(255),
      mobile_image VARCHAR(255),
      position INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMPTZ DEFAULT NULL
    );

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS frontend_content_items;
    DROP TABLE IF EXISTS frontend_page_sections;
    DROP TABLE IF EXISTS frontend_content_types;
    DROP TABLE IF EXISTS websites;
  `);
}
