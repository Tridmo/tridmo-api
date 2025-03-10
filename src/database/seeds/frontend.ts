import { type Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("websites")
    .insert([
      { name: "Demod", domain: "demod.uz" },
      { name: "Timber", domain: "timber.uz" }
    ])
    .onConflict("name")
    .ignore();

  const demodId = (await knex('websites').where('name', '=', 'Demod').first())?.id
  const timberId = (await knex('websites').where('name', '=', 'Timber').first())?.id

  await knex("frontend_content_types")
    .insert([
      { name: "banner", display_name: "Главный баннер", website_id: timberId },
      { name: "ad-banner", display_name: "Рекламный баннер", website_id: timberId },
      { name: "brands-preview-list-item", display_name: "Бренд на главной странице", website_id: demodId },
    ])
    .onConflict("name")
    .ignore();

  await knex("frontend_page_sections")
    .insert([
      { name: "landing-header-hero", display_name: "Раздел заголовка главной страницы" },
      { name: "brands-preview-list", display_name: "Список брендов на главной странице", website_id: timberId },
      { name: "landing-horizontal-ad-banners", display_name: "Горизонтальное объявление на главной странице", website_id: timberId },
    ])
    .onConflict("name")
    .ignore();
}
