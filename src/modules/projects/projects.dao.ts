import KnexService from '../../database/connection';
import { IDefaultQuery } from '../shared/interface/query.interface';
import { getFirst } from "../shared/utils/utils";
import { ICreateProject, ICreateProjectModel, IFilterProject, IProject, IProjectModel, IUpdateProject } from "./projects.interface";

export default class ProjectsDAO {
  async create(values: ICreateProject): Promise<IProject> {
    return getFirst(
      await KnexService('projects')
        .insert({
          ...values
        })
        .returning('*')
    )
  }

  async update(id: string, values: IUpdateProject): Promise<IProject> {
    return getFirst(
      await KnexService('projects')
        .where({ id: id })
        .update({
          ...values
        })
        .returning("*")
    )
  }

  async createProjectModel(values: ICreateProjectModel): Promise<IProjectModel> {
    return getFirst(
      await KnexService('project_models')
        .insert({
          ...values
        })
        .returning('*')
    )
  }

  async bulkUpsertProjectModels(data: ICreateProjectModel[]): Promise<IProjectModel[]> {
    return await KnexService.raw(
      `? ON CONFLICT (project_id, model_id) DO NOTHING RETURNING *;`,
      [KnexService("project_models").insert(data)],
    );
  }

  async getById(id: string): Promise<any> {
    return getFirst(
      await KnexService('projects')
        .select([
          'projects.*',
          KnexService.raw(`(
            SELECT COUNT(DISTINCT models.brand_id)
            FROM project_models
            LEFT JOIN models ON project_models.model_id = models.id
            WHERE project_models.project_id = projects.id
          ) as brands_count`),
          KnexService.raw(`(
            SELECT COUNT(DISTINCT models.id)
            FROM project_models
            LEFT JOIN models ON project_models.model_id = models.id
            WHERE project_models.project_id = projects.id
          ) as models_count`),
          KnexService.raw(`(
            SELECT SUM(models.furniture_cost)
            FROM project_models
            LEFT JOIN models ON project_models.model_id = models.id
            WHERE project_models.project_id = projects.id
          ) as cumulative_cost`),
          KnexService.raw(`jsonb_agg(distinct project_models) as project_models`)
        ])
        .leftJoin(function () {
          this.select([
            'project_models.*',
            'models.id as model.id',
            'models.name as model.name',
            'models.availability as model.availability',
            'models.furniture_cost as model.furniture_cost',
            'models.slug as model.slug',
            'models.brand_id as model.brand.id',
            'models.brand_name as model.brand.name',
            'models.brand_slug as model.brand.slug',
            'models.cover as model.cover',
          ])
            .from('project_models')
            .as('project_models')
            .leftJoin(function () {
              this.select([
                'models.id',
                'models.name',
                'models.availability',
                'models.furniture_cost',
                'models.slug',
                'models.brand_id',
                'brands.name as brand_name',
                'brands.slug as brand_slug',
                KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
              ])
                .from('models')
                .as('models')
                .leftJoin("brands", { 'models.brand_id': 'brands.id' })
                .leftJoin(function () {
                  this.select([
                    'model_images.id',
                    'model_images.is_main',
                    'model_images.image_id',
                    'model_images.model_id',
                    'model_images.created_at',

                    // 'images.id as images.id',
                    'images.src as image_src'
                  ])
                    .from('model_images')
                    .as('model_images')
                    .where('model_images.is_main', '=', true)
                    .leftJoin("images", { 'model_images.image_id': 'images.id' })
                    .groupBy('model_images.id', 'images.id')
                    .orderBy(`model_images.created_at`, 'asc')
                }, { 'models.id': 'model_images.model_id' })
                .groupBy('models.id', 'brands.id')
            }, { 'models.id': 'project_models.model_id' })
            .groupBy(
              'project_models.id',
              'models.id',
              'models.name',
              'models.furniture_cost',
              'models.availability',
              'models.slug',
              'models.brand_id',
              'models.brand_name',
              'models.brand_slug',
              'models.cover',
            )
        }, { 'project_models.project_id': 'projects.id' })
        .groupBy('projects.id')
        .where('projects.id', '=', id)
    )
  }
  async getBy(filters: IFilterProject): Promise<any[]> {
    return await KnexService('projects')
      .select('*')
      .where(filters)
  }
  async getById_min(id: string): Promise<IProject> {
    return getFirst(
      await KnexService('projects')
        .select('*')
        .where({ id })
    )
  }

  async getProjectModel(project_id: string, model_id: string) {
    return getFirst(
      await KnexService('project_models')
        .select('*')
        .where({ model_id, project_id })
    )
  }

  async getAll(filters: IFilterProject, sorts: IDefaultQuery): Promise<any[]> {
    const { order, orderBy, limit, offset } = sorts
    return await KnexService('projects')
      .select([
        'projects.*',
        KnexService.raw(`jsonb_agg(distinct project_models) as project_models`)
      ])
      .leftJoin(function () {
        this.select([
          'project_models.*',
          'models.id as model.id',
          'models.name as model.name',
          'models.slug as model.slug',
          'models.brand_id as model.brand.id',
          'models.brand_name as model.brand.name',
          'models.cover as model.cover',
          KnexService.raw('ROW_NUMBER() OVER (PARTITION BY project_models.project_id ORDER BY project_models.created_at) as rownum')
        ])
          .from('project_models')
          .as('project_models')
          .leftJoin(function () {
            this.select([
              'models.id',
              'models.name',
              'models.slug',
              'models.brand_id',
              'brands.name as brand_name',
              KnexService.raw('jsonb_agg(distinct "model_images") as cover'),
            ])
              .from('models')
              .as('models')
              .leftJoin("brands", { 'models.brand_id': 'brands.id' })
              .leftJoin(function () {
                this.select([
                  'model_images.id',
                  'model_images.is_main',
                  'model_images.image_id',
                  'model_images.model_id',
                  'model_images.created_at',

                  // 'images.id as images.id',
                  'images.src as image_src'
                ])
                  .from('model_images')
                  .as('model_images')
                  .where('model_images.is_main', '=', true)
                  .leftJoin("images", { 'model_images.image_id': 'images.id' })
                  .groupBy('model_images.id', 'images.id')
                  .orderBy(`model_images.created_at`, 'asc')
              }, { 'models.id': 'model_images.model_id' })
              .groupBy('models.id', 'brands.id')
          }, { 'models.id': 'project_models.model_id' })
          .groupBy(
            'project_models.id',
            'models.id',
            'models.name',
            'models.slug',
            'models.brand_id',
            'models.brand_name',
            'models.cover',
          )
      }, { 'project_models.project_id': 'projects.id' })
      .groupBy('projects.id')
      .offset(offset)
      .limit(limit)
      .orderBy(`projects.${orderBy}`, order)
      .where(filters)
  }

  async count(filters: IFilterProject) {
    return (
      await KnexService('projects')
        .count('id')
        .where(filters)
    )[0].count
  }

  async deleteBy(filters: IFilterProject): Promise<number> {
    return await KnexService('projects')
      .where(filters)
      .delete()
  }
  async deleteProjectModel(project_id, model_id): Promise<number> {
    return await KnexService('project_models')
      .where({ project_id, model_id })
      .delete()
  }
  async deleteProjectModelByProject(project_id: string): Promise<number> {
    return await KnexService('project_models')
      .where({ project_id })
      .delete()
  }
}