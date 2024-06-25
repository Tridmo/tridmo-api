import { adminUsername } from "../../config/conf"
import knexInstance from "../../database/connection"
import { authVariables } from "../auth/variables"
import { IFilterDownload } from "../downloads/downloads.interface"
import { IDefaultQuery } from "../shared/interface/query.interface"
import { IDateFilters, IGetDownloadsCountFilter } from "./stats.interface"

export default class StatsDao {
  async getModelsCount(filters) {
    const { categories, styles, name, ...otherFilters } = filters

    return (
      await knexInstance('models')
        .countDistinct("models.id")
        .innerJoin(function () {
          this.select(['model_colors.model_id'])
            .from('model_colors')
            .groupBy('model_colors.id')
            .as('model_colors')
        }, { 'models.id': 'model_colors.model_id' })
        .where({ is_deleted: false })
        .modify((query) => {
          if (categories && categories.length > 0) query.whereIn("category_id", Array.isArray(categories) ? categories : [categories])
          if (styles && styles.length > 0) query.whereIn("style_id", Array.isArray(styles) ? styles : [styles])
          if (Object.keys(otherFilters).length > 0) query.andWhere(otherFilters)
          if (name && name.length) query.whereILike('models.name', `%${name}%`)
        })
    )[0].count
  }
  async getDownloadsCount({ model_id, brand_id, user_id }: IGetDownloadsCountFilter) {

    return (
      await knexInstance('downloads')
        .count('id')
        .modify(q => {
          if (model_id) q.where({ model_id })
          if (user_id) q.where({ user_id })
          if (brand_id) {
            q.innerJoin(function () {
              this.select('id', 'brand_id')
                .from('models')
                .as('models')
                .where({ brand_id })
            }, { 'downloads.model_id': 'models.id' })
          }
        })
    )[0].count

  }
  async getTagsCount({ model_id, brand_id, user_id }: IGetDownloadsCountFilter) {

    return (
      await knexInstance('interior_models')
        .count('id')
        .modify(q => {
          if (model_id) q.where({ model_id })
          if (user_id) q.where({ user_id })
          if (brand_id) {
            q.innerJoin(function () {
              this.select('id', 'brand_id')
                .from('models')
                .as('models')
                .where({ brand_id })
            }, { 'downloads.model_id': 'models.id' })
          }
        })
    )[0].count

  }


  async getMostDownloadedModels({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    let query = knexInstance("models")
      .select([
        'models.id',
        'models.category_id',
        'models.brand_id',
        'models.name',
        'models.slug',
        'models.availability',
        'models.top',
        'categories.name as category_name',
        'brands.id as brand_id',
        'brands.name as brand_name',
        'brands.slug as brand_slug',
        knexInstance.raw('jsonb_agg(distinct "model_images") as cover'),
        knexInstance.raw('count(downloads.id) as downloads_count'),
      ])
      .leftJoin("brands", { 'models.brand_id': 'brands.id' })
      .leftJoin("categories", { 'models.category_id': 'categories.id' })
      .leftJoin('downloads', 'models.id', 'downloads.model_id')
      .leftJoin(function () {
        this.select([
          'model_images.id',
          'model_images.is_main',
          'model_images.image_id',
          'model_images.model_id',
          'model_images.created_at',
          'images.src as image_src'
        ])
          .from('model_images')
          .as('model_images')
          .where('model_images.is_main', '=', true)
          .leftJoin("images", { 'model_images.image_id': 'images.id' })
          .groupBy('model_images.id', 'images.id')
          .orderBy('model_images.created_at', 'asc')
      }, { 'models.id': 'model_images.model_id' })
      .limit(limit)
      .where({ is_deleted: false })
      .orderBy('downloads_count', 'desc')
      .groupBy(
        'models.id',
        'brands.id',
        'categories.name'
      );

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `downloads.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Apply year filter if provided
    if (year) {
      query = query.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      query = query.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      query = query.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      query = query.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Exclude models with no downloads
    query = query.having(knexInstance.raw('count(downloads.id)'), '>', 0);

    return await query;

  }
  async getBrandsWithMostDownloads({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `downloads.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Define the base query for models with conditional time filtering
    let modelsSubquery = knexInstance('models')
      .select('models.brand_id')
      .count('downloads.id as downloads_count')
      .leftJoin('downloads', 'models.id', 'downloads.model_id')
      .groupBy('models.brand_id')

    // Apply year filter if provided
    if (year) {
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Subquery to count models for each brand
    const modelsCountSubquery = knexInstance('models')
      .select('brand_id')
      .count('id as models_count')
      .groupBy('brand_id')
      .as('modelscount');

    // Main query
    const query = await knexInstance('brands')
      .select([
        "brands.id",
        "brands.name",
        "brands.slug",
        "brands.site_link",
        "brands.description",
        "images.key as image_src",
        knexInstance.raw('coalesce(modelscount.models_count, 0) as models_count'), // Using the subquery to get models_count
        knexInstance.raw('coalesce(sum(downloads.downloads_count), 0) as downloads_count')
      ])
      .leftJoin('images', 'brands.image_id', 'images.id')
      .leftJoin(modelsSubquery.as('downloads'), 'brands.id', 'downloads.brand_id')
      .leftJoin(modelsCountSubquery, 'brands.id', 'modelscount.brand_id')
      .groupBy('brands.id', 'images.key', 'modelscount.models_count')
      .having(knexInstance.raw('coalesce(sum(downloads.downloads_count), 0)'), '>', 0) // Exclude brands with no downloads
      .orderBy('downloads_count', 'desc')
      .limit(limit);

    return query;

  }
  async getCategoriesWithMostDownloads({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `downloads.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Define the base query for downloads with conditional time filtering
    let downloadsSubquery = knexInstance('downloads')
      .select('models.category_id')
      .count('downloads.id as downloads_count')
      .leftJoin('models', 'downloads.model_id', 'models.id')
      .groupBy('models.category_id');

    // Apply year filter if provided
    if (year) {
      downloadsSubquery = downloadsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      downloadsSubquery = downloadsSubquery.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      downloadsSubquery = downloadsSubquery.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      downloadsSubquery = downloadsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    const modelsCountSubquery = knexInstance('models')
      .select('category_id')
      .count('id as models_count')
      .groupBy('category_id')
      .as('modelscount');

    // Main query
    const query = await knexInstance('categories')
      .select([
        'categories.id',
        'categories.name',
        knexInstance.raw('coalesce(downloadssubquery.downloads_count, 0) as downloads_count'),
        knexInstance.raw('coalesce(modelscount.models_count, 0) as models_count')
      ])
      .leftJoin(modelsCountSubquery, 'categories.id', 'modelscount.category_id')
      .leftJoin(downloadsSubquery.as('downloadssubquery'), 'categories.id', 'downloadssubquery.category_id')
      .where('categories.type', '=', 'model')
      .whereNotNull('parent_id')
      .groupBy('categories.id', 'categories.name', 'downloadssubquery.downloads_count', 'modelscount.models_count')
      .having(knexInstance.raw('coalesce(downloadssubquery.downloads_count, 0)'), '>', 0) // Exclude categories with no downloads
      .orderBy('downloads_count', 'desc')
      .limit(limit);


    return query;

  }


  async getMostUsedModels({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    let query = knexInstance("models")
      .select([
        'models.id',
        'models.category_id',
        'models.brand_id',
        'models.name',
        'models.slug',
        'models.availability',
        'models.top',
        'categories.name as category_name',
        'brands.id as brand_id',
        'brands.name as brand_name',
        'brands.slug as brand_slug',
        knexInstance.raw('jsonb_agg(distinct "model_images") as cover'),
        knexInstance.raw('count(interior_models.id) as tags_count'),
      ])
      .leftJoin("brands", { 'models.brand_id': 'brands.id' })
      .leftJoin("categories", { 'models.category_id': 'categories.id' })
      .leftJoin('interior_models', { 'models.id': 'interior_models.model_id' })
      .leftJoin(function () {
        this.select([
          'model_images.id',
          'model_images.is_main',
          'model_images.image_id',
          'model_images.model_id',
          'model_images.created_at',
          'images.src as image_src'
        ])
          .from('model_images')
          .as('model_images')
          .where('model_images.is_main', '=', true)
          .leftJoin("images", { 'model_images.image_id': 'images.id' })
          .groupBy('model_images.id', 'images.id')
          .orderBy('model_images.created_at', 'asc')
      }, { 'models.id': 'model_images.model_id' })
      .limit(limit)
      .where({ is_deleted: false })
      .orderBy('tags_count', 'desc')
      .groupBy(
        'models.id',
        'brands.id',
        'categories.name'
      );

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `interior_models.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Apply year filter if provided
    if (year) {
      query = query.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      query = query.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      query = query.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      query = query.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Exclude models with no interior_models
    query = query.having(knexInstance.raw('count(interior_models.id)'), '>', 0);

    return await query;

  }
  async getBrandsWithMostTags({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `interior_models.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Define the base query for models with conditional time filtering
    let modelsSubquery = knexInstance('models')
      .select('models.brand_id')
      .count('interior_models.id as tags_count')
      .leftJoin('interior_models', 'models.id', 'interior_models.model_id')
      .groupBy('models.brand_id');

    // Apply year filter if provided
    if (year) {
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      modelsSubquery = modelsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Subquery to count models for each brand
    const modelsCountSubquery = knexInstance('models')
      .select('brand_id')
      .count('id as models_count')
      .groupBy('brand_id')
      .as('modelscount');

    // Main query
    const query = await knexInstance('brands')
      .select([
        "brands.id",
        "brands.name",
        "brands.slug",
        "brands.site_link",
        "brands.description",
        "images.key as image_src",
        knexInstance.raw('coalesce(modelscount.models_count, 0) as models_count'), // Using the subquery to get models_count
        knexInstance.raw('coalesce(sum(tags.tags_count), 0) as tags_count')
      ])
      .leftJoin('images', 'brands.image_id', 'images.id')
      .leftJoin(modelsSubquery.as('tags'), 'brands.id', 'tags.brand_id')
      .leftJoin(modelsCountSubquery, 'brands.id', 'modelscount.brand_id')
      .groupBy('brands.id', 'images.key', 'modelscount.models_count')
      .having(knexInstance.raw('coalesce(sum(tags.tags_count), 0)'), '>', 0) // Exclude brands with no downloads
      .orderBy('tags_count', 'desc')
      .limit(limit);

    return query;

  }
  async getCategoriesWithMostTags({ limit, month, year, week }: IDefaultQuery & IDateFilters) {

    // Adjust for timezone difference
    const timezoneOffset = '-05:00';
    const offsetQuery = `interior_models.created_at AT TIME ZONE '${timezoneOffset}'`;

    // Define the base query for interior_models with conditional time filtering
    let tagsSubquery = knexInstance('interior_models')
      .select('models.category_id')
      .count('interior_models.id as tags_count')
      .leftJoin('models', 'interior_models.model_id', 'models.id')
      .groupBy('models.category_id');

    // Apply year filter if provided
    if (year) {
      tagsSubquery = tagsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Apply month filter if provided
    if (year && month) {
      tagsSubquery = tagsSubquery.whereRaw(`EXTRACT(MONTH FROM ${offsetQuery}) = ?`, [month]);
    }

    // Apply week filter if provided
    if (year && week) {
      // Extract the ISO week number from the timestamp and compare with the provided week
      tagsSubquery = tagsSubquery.whereRaw(`EXTRACT(WEEK FROM ${offsetQuery}) = ?`, [week]);

      // Additionally, filter by the year to ensure week is correct across years
      tagsSubquery = tagsSubquery.whereRaw(`EXTRACT(YEAR FROM ${offsetQuery}) = ?`, [year]);
    }

    // Subquery to count models for each category
    const modelsCountSubquery = knexInstance('models')
      .select('category_id')
      .count('id as models_count')
      .groupBy('category_id')
      .as('modelscount');

    // Main query
    const query = await knexInstance('categories')
      .select([
        'categories.id',
        'categories.name',
        knexInstance.raw('coalesce(tagssubquery.tags_count, 0) as tags_count'),
        knexInstance.raw('coalesce(modelscount.models_count, 0) as models_count')
      ])
      .leftJoin(modelsCountSubquery, 'categories.id', 'modelscount.category_id')
      .leftJoin(tagsSubquery.as('tagssubquery'), 'categories.id', 'tagssubquery.category_id')
      .where('categories.type', '=', 'model')
      .whereNotNull('parent_id')
      .groupBy('categories.id', 'categories.name', 'tagssubquery.tags_count', 'modelscount.models_count')
      .having(knexInstance.raw('coalesce(tagssubquery.tags_count, 0)'), '>', 0) // Exclude categories with no interior_models
      .orderBy('tags_count', 'desc')
      .limit(limit);

    return query;

  }


  async getRegistersMonthly({ month, year }: IDateFilters) {
    const result = await knexInstance('profiles')
      .select(knexInstance.raw('EXTRACT(MONTH FROM (profiles.created_at - interval \'5 hours\')) AS month'))
      .count('profiles.id AS count')
      .whereRaw('EXTRACT(YEAR FROM (profiles.created_at - interval \'5 hours\')) = ?', [year])
      .innerJoin(function () {
        this.select('id', 'role_id', 'user_id').from('user_roles').as('user_roles').where('role_id', '=', authVariables.roles.designer)
      }, { 'user_roles.user_id': 'profiles.id' })
      .groupBy(knexInstance.raw('EXTRACT(MONTH FROM (profiles.created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(MONTH FROM (profiles.created_at - interval \'5 hours\'))'));

    return result;
  }
  async getRegistersDaily({ month, year }: IDateFilters) {
    const result = await knexInstance('profiles')
      .select(knexInstance.raw('EXTRACT(DAY FROM (profiles.created_at - interval \'5 hours\')) AS day'))
      .count('profiles.id AS count')
      .whereRaw('EXTRACT(YEAR FROM (profiles.created_at - interval \'5 hours\')) = ?', [year])
      .andWhereRaw('EXTRACT(MONTH FROM (profiles.created_at - interval \'5 hours\')) = ?', [month])
      .innerJoin(function () {
        this.select('id', 'role_id', 'user_id').from('user_roles').as('user_roles').where('role_id', '=', authVariables.roles.designer)
      }, { 'user_roles.user_id': 'profiles.id' })
      .groupBy(knexInstance.raw('EXTRACT(DAY FROM (profiles.created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(DAY FROM (profiles.created_at - interval \'5 hours\'))'));

    return result;
  }


  async getDownloadsMonthly({ year, model_id, brand_id, user_id }: IDateFilters & IFilterDownload) {
    const result = await knexInstance('downloads')
      .select(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) AS month'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .groupBy(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'))
      .modify(q => {
        if (model_id) q.where({ model_id })
        if (user_id) q.where({ user_id })
        if (brand_id) {
          q.innerJoin(function () {
            this.select('id', 'brand_id')
              .from('models')
              .as('models')
              .where({ brand_id })
          }, { 'downloads.model_id': 'models.id' })
        }
      })

    return result;
  }
  async getDownloadsDaily({ month, year, model_id, brand_id, user_id }: IDateFilters & IFilterDownload) {
    const result = await knexInstance('downloads')
      .select(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\')) AS day'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .andWhereRaw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) = ?', [month])
      .groupBy(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))
      .modify(q => {
        if (model_id) q.where({ model_id })
        if (user_id) q.where({ user_id })
        if (brand_id) {
          q.innerJoin(function () {
            this.select('id', 'brand_id')
              .from('models')
              .as('models')
              .where({ brand_id })
          }, { 'downloads.model_id': 'models.id' })
        }
      })

    return result;
  }


  async getTagsMonthly({ year, model_id, brand_id, user_id }: IDateFilters & IFilterDownload) {
    const result = await knexInstance('interior_models')
      .select(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) AS month'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .groupBy(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'))
      .modify(q => {
        if (model_id) q.where({ model_id })
        if (user_id) q.where({ user_id })
        if (brand_id) {
          q.innerJoin(function () {
            this.select('id', 'brand_id')
              .from('models')
              .as('models')
              .where({ brand_id })
          }, { 'interior_models.model_id': 'models.id' })
        }
      })

    return result;
  }
  async getTagsDaily({ month, year, model_id, brand_id, user_id }: IDateFilters & IFilterDownload) {
    const result = await knexInstance('interior_models')
      .select(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\')) AS day'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .andWhereRaw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) = ?', [month])
      .groupBy(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))
      .modify(q => {
        if (model_id) q.where({ model_id })
        if (user_id) q.where({ user_id })
        if (brand_id) {
          q.innerJoin(function () {
            this.select('id', 'brand_id')
              .from('models')
              .as('models')
              .where({ brand_id })
          }, { 'interior_models.model_id': 'models.id' })
        }
      })

    return result;
  }


  async getInteriorsMonthly({ year }: IDateFilters) {
    const result = await knexInstance('interiors')
      .select(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) AS month'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .groupBy(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\'))'));

    return result;
  }
  async getInteriorsDaily({ month, year }: IDateFilters & IFilterDownload) {
    const result = await knexInstance('interiors')
      .select(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\')) AS day'))
      .count('id AS count')
      .whereRaw('EXTRACT(YEAR FROM (created_at - interval \'5 hours\')) = ?', [year])
      .andWhereRaw('EXTRACT(MONTH FROM (created_at - interval \'5 hours\')) = ?', [month])
      .groupBy(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))
      .orderByRaw(knexInstance.raw('EXTRACT(DAY FROM (created_at - interval \'5 hours\'))'))

    return result;
  }


}