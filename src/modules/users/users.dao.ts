import { Knex } from 'knex';
import { filter, isEmpty } from 'lodash';
import KnexService from '../../database/connection';
import { getFirst } from '../shared/utils/utils';
import { ICreateUser, IUpdateUser, IUser } from './users.interface';
import { authVariables } from '../auth/variables';
import { usersVariables } from './variables';
import { isDefined } from 'class-validator';

export default class UsersDAO {
  async create({
    user_id,
    full_name,
    email,
    username,
    company_name,
    image_src
  }: ICreateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .insert({
          user_id,
          full_name,
          email,
          username,
          company_name,
          image_src
        })
        .returning('*'),
    );
  }

  async update(id: string, values: IUpdateUser): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .update({
          ...values
        })
        .where({ id: id })
        .returning('*'),
    );
  }


  async getAll(filters, sorts) {
    const { limit, offset, order, orderBy } = sorts;
    const { full_name, role_id, ...otherFilters } = filters;

    const isDesigner = role_id && role_id == authVariables.roles.designer;

    return await KnexService('profiles')
      .select([
        "profiles.id",
        "profiles.image_src",
        "profiles.full_name",
        "profiles.username",
        "profiles.company_name",
        ...(isDesigner ? [
          KnexService.raw(`coalesce(count("interiors"."id"), 0) as designs_count`),
          KnexService.raw(`coalesce(sum("tags_count".count), 0) as tags_count`),
          KnexService.raw(`(coalesce(count("interiors"."id"), 0) * ${usersVariables.scoreForDesign} + coalesce(sum("tags_count".count), 0) * ${usersVariables.scoreForTag}) as rating`)
        ] : []),
      ])
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "role.id");
      }, { "profiles.id": "user_roles.user_id" })
      .modify((q) => {
        if (isDesigner) {
          q.leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
          q.leftJoin(function () {
            this.select('interior_id', KnexService.raw('count(id) as count'))
              .from('interior_models')
              .groupBy('interior_id')
              .as('tags_count')
          }, { 'interiors.id': 'tags_count.interior_id' })
        }
      })
      .limit(limit)
      .offset(offset)
      .groupBy("profiles.id", "user_roles.id", "user_roles.role_id")
      .modify((q) => {
        if (full_name) {
          q.whereILike(`full_name`, `%${full_name}%`)
            .orWhereILike(`username`, `%${full_name}%`)
        }
        if (Object.entries(otherFilters).length) q.andWhere(otherFilters);
        if (role_id) {
          q.andWhere('user_roles.role_id', role_id);
        }
        q.orderBy(
          orderBy === 'rating' || orderBy === 'designs_count' || orderBy === 'tags_count'
            ? orderBy
            : `profiles.${orderBy}`,
          order
        );
      });
  }

  async getAll_admin(filters, sorts) {
    const { limit, offset, order, orderBy } = sorts;
    const { key, keyword, role_id, downloads_from_brand, downloaded_model, as_download, model_name, ...otherFilters } = filters;

    const isDesigner = role_id && role_id == authVariables.roles.designer;

    const query = KnexService('profiles')
      .select([
        "profiles.*",
        "user_roles.role_id as role_id",
        "role_name as role_name",
        "roles_id as role_id",
        KnexService.raw(`jsonb_agg(distinct user_bans) as bans`),
        ...(isDesigner ? [
          KnexService.raw(`count(distinct "interiors"."id") as designs_count`),
          KnexService.raw(`count(distinct interior_models.id) as tags_count`),
          KnexService.raw(`count(distinct downloads.id) as downloads_count`),
        ] : []),
        ...(downloaded_model ? ['downloads.created_at as downloaded_at'] : []),
        ...(downloads_from_brand || as_download ? [
          'downloads.created_at as downloaded_at',
          'models.id as model_id',
          'models.name as model_name',
          'models.slug as model_slug',
          'models.model_cover as model_cover'
        ] : [])
      ])
      .leftJoin('user_bans', function () {
        this.on('user_bans.user_id', '=', 'profiles.id')
          .andOn('user_bans.permanent', KnexService.raw('?', [true]))
      })
      .innerJoin(function () {
        this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "roles.name as role_name", "roles.id as roles_id"])
          .from("user_roles")
          .as("user_roles")
          .leftJoin({ roles: "roles" }, { "user_roles.role_id": "roles.id" })
          .whereNot("role_id", 1)
          .groupBy("user_roles.id", "roles.id");
      }, { "profiles.id": "user_roles.user_id" })
      .modify((q) => {
        if (isDesigner) {
          if (!downloads_from_brand && !downloaded_model && !as_download) {
            q.leftJoin('downloads', { 'profiles.id': 'downloads.user_id' });
          }
          q.leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
          q.leftJoin(function () {
            this.select('interior_models.id', 'interior_id', 'model_id')
              .from('interior_models')
              .groupBy('interior_models.id', 'interior_id', 'model_id')
              .as('interior_models')
              .modify(tag_query => {
                if (downloads_from_brand) {
                  tag_query.innerJoin({ model: 'models' }, { 'interior_models.model_id': 'model.id' })
                    .where('model.brand_id', '=', downloads_from_brand)
                }
              })
          }, { 'interiors.id': 'interior_models.interior_id' })
            .groupBy([
              "profiles.id",
              "user_roles.id",
              "user_roles.role_id",
              "role_name",
              "roles_id",
              'downloads.id',
            ])
        }

        if (downloads_from_brand || downloaded_model || as_download) {

          if (downloads_from_brand) {
            q.innerJoin(function () {
              this.select([
                'id', 'user_id', 'model_id', 'downloads.created_at',
              ])
                .from('downloads')
                .as('downloads');
            }, { 'profiles.id': 'downloads.user_id' })
              .innerJoin(function () {
                this.select([
                  'models.id',
                  'models.name',
                  'models.slug',
                  'models.brand_id',
                  'image_src as model_cover',
                ])
                  .from('models')
                  .as('models')
                  .leftJoin(function () {
                    this.select([
                      'model_images.id',
                      'model_images.is_main',
                      'model_images.image_id',
                      'model_images.model_id',
                      'images.src as image_src'
                    ])
                      .from('model_images')
                      .as('model_images')
                      .where('model_images.is_main', '=', true)
                      .leftJoin("images", { 'model_images.image_id': 'images.id' })
                      .groupBy('model_images.id', 'images.id')
                  }, { 'models.id': 'model_images.model_id' })
                  .groupBy('models.id', 'model_images.image_src')
              }, { 'downloads.model_id': 'models.id' })
              .where('models.brand_id', '=', downloads_from_brand)
            q.groupBy([
              "profiles.id",
              "user_roles.id",
              "user_roles.role_id",
              "role_name",
              "roles_id",
              'downloads.id',
              "downloads.created_at",
              'models.id',
              'models.name',
              'models.slug',
              'models.model_cover'
            ])
          }
          if (downloaded_model) {
            q.innerJoin(function () {
              this.select([
                'id', 'user_id', 'model_id', 'downloads.created_at',
              ])
                .from('downloads')
                .as('downloads');
            }, { 'profiles.id': 'downloads.user_id' })
              .where('downloads.model_id', '=', downloaded_model)
            q.orderBy(`downloads.created_at`, order)
              .groupBy([
                "profiles.id",
                "user_roles.id",
                "user_roles.role_id",
                "role_name",
                "roles_id",
                'downloads.created_at'
              ])
          }
          if (as_download) {
            q.innerJoin(function () {
              this.select([
                'id', 'user_id', 'model_id', 'downloads.created_at',
              ])
                .from('downloads')
                .as('downloads');
            }, { 'profiles.id': 'downloads.user_id' })
              .innerJoin(function () {
                this.select([
                  'models.id',
                  'models.name',
                  'models.slug',
                  'models.brand_id',
                  'image_src as model_cover',
                ])
                  .from('models')
                  .as('models')
                  .leftJoin(function () {
                    this.select([
                      'model_images.id',
                      'model_images.is_main',
                      'model_images.image_id',
                      'model_images.model_id',
                      'images.src as image_src'
                    ])
                      .from('model_images')
                      .as('model_images')
                      .where('model_images.is_main', '=', true)
                      .leftJoin("images", { 'model_images.image_id': 'images.id' })
                      .groupBy('model_images.id', 'images.id')
                  }, { 'models.id': 'model_images.model_id' })
                  .groupBy('models.id', 'model_images.image_src')
                  .modify(mq => {
                    if (model_name) {
                      mq.whereILike('models.name', `%${model_name}%`)
                    }
                  })
              }, { 'downloads.model_id': 'models.id' })
            q.groupBy([
              "profiles.id",
              "user_roles.id",
              "user_roles.role_id",
              "role_name",
              "roles_id",
              'downloads.id',
              "downloads.created_at",
              'models.id',
              'models.name',
              'models.slug',
              'models.model_cover'
            ])
          }
        }
        else {
          q.groupBy([
            "profiles.id",
            "user_roles.id",
            "user_roles.role_id",
            "role_name",
            "roles_id",
            'downloads.id',
          ])
        }

        if (Object.entries(otherFilters).length) q.andWhere(otherFilters);

        if (key) {
          q.whereILike('full_name', `%${key}%`)
          q.orWhereILike('username', `%${key}%`)
        }

        if (role_id) {
          q.andWhere('user_roles.role_id', role_id);
        }

        q.orderBy(
          ['designs_count', 'tags_count', 'downloads_count', 'downloaded_at'].includes(orderBy)
            ? orderBy
            : `profiles.${orderBy}`,
          order
        )
      })
      .limit(limit)
      .offset(offset);

    const res = await query;
    return res;
  }


  async count(filters) {
    const { full_name, key, keyword, role_id, downloads_from_brand, downloaded_model, as_download, model_name, ...otherFilters } = filters;

    const query = KnexService('profiles')
      .countDistinct('profiles.id')
      .innerJoin('user_roles', 'profiles.id', 'user_roles.user_id')
      .modify((q) => {
        if (key) {
          q.whereILike('full_name', `%${key}%`)
          q.orWhereILike('username', `%${key}%`)
        }
        if (isDefined(role_id)) q.where('user_roles.role_id', role_id)
        if (isDefined(full_name)) q.whereILike(`full_name`, `%${full_name}%`)
        if (Object.entries(otherFilters).length) q.andWhere(otherFilters)
        if (isDefined(downloads_from_brand)) {
          q.innerJoin('downloads', { 'profiles.id': 'downloads.user_id' })
          q.innerJoin('models', { 'downloads.model_id': 'models.id' })
          q.where('models.brand_id', '=', downloads_from_brand)
          q.groupBy([
            "profiles.id",
            "user_roles.id",
            'downloads.id',
            'models.id',
          ])
        }
        if (isDefined(as_download)) {
          q.innerJoin('downloads', { 'profiles.id': 'downloads.user_id' })
          q.innerJoin('models', { 'downloads.model_id': 'models.id' })
          q.modify(q => {
            if (model_name) {
              q.whereILike('models.name', `%${model_name}%`)
            }
          })
          q.groupBy([
            "profiles.id",
            "user_roles.id",
            'downloads.id',
            'models.id',
          ])
        }
        if (isDefined(downloaded_model)) {
          q.innerJoin('downloads', { 'profiles.id': 'downloads.user_id' })
          q.where('downloads.model_id', '=', downloaded_model)
          q.groupBy([
            "profiles.id",
            "user_roles.id",
            'downloads.id',
          ])
        }
        else {
          q.groupBy([
            "profiles.id",
            "user_roles.id",
            'downloads.id',
          ])
        }
      })

    const result = await query;

    return (result)[0].count
  }

  getById(id: string): Promise<IUser> {
    return KnexService('profiles')
      .where({ id })
      .first();
  }

  getByUserId(user_id: string): Promise<IUser> {
    return KnexService('profiles')
      .select([
        'profiles.*',
        "user_roles.role_id as role_id",
      ])
      .innerJoin('user_roles', { 'user_roles.user_id': 'profiles.id' })
      .groupBy('profiles.id', "user_roles.role_id")
      .where({ 'profiles.user_id': user_id })
      .first();
  }

  async getByUserIdAndRole(user_id: string, role: number): Promise<IUser> {
    return await KnexService('profiles')
      .select('profiles.*')
      .innerJoin(function () {
        this.select('user_roles.*')
          .from('user_roles')
          .as('user_roles')
          .where('user_roles.role_id', '=', role)
      }, { 'user_roles.user_id': 'profiles.id' })
      .where({ 'profiles.user_id': user_id })
      .first();
  }

  async getByEmail(email: string): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*",
          "user_roles.role_id as role.id",
          "role_name as role.name",
          "roles_id as role.id",
          KnexService.raw(`count(distinct interiors.id) as designs_count`),
          KnexService.raw(`interior_models.count as tags_count`),
        ])
        .innerJoin(function () {
          this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name", "role.id as roles_id"])
            .from("user_roles")
            .as("user_roles")
            .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
            .whereNot("role_id", 1)
            .groupBy("user_roles.id", "role.id");
        }, { "profiles.id": "user_roles.user_id" })
        .leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
        .leftJoin(function () {
          this.select('interior_id', KnexService.raw('count(interior_models.id) as count'))
            .from('interior_models')
            .groupBy('interior_id')
            .as('interior_models')
        }, { 'interiors.id': 'interior_models.interior_id' })
        .groupBy(
          'profiles.id', "user_roles.id", "user_roles.role_id", "role_name", "roles_id", 'interior_models.count'
        )
        .where({ email })
    )
  }

  async getByUsername(username: string, filters: any = {}): Promise<IUser> {

    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*",
          "user_roles.role_id as role.id",
          "role_name as role.name",
          "roles_id as role.id",
          KnexService.raw(`count(distinct interiors.id) as designs_count`),
          KnexService.raw(`interior_models.count as tags_count`),
        ])
        .innerJoin(function () {
          this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name", "role.id as roles_id"])
            .from("user_roles")
            .as("user_roles")
            .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
            .whereNot("role_id", 1)
            .groupBy("user_roles.id", "role.id");
        }, { "profiles.id": "user_roles.user_id" })
        .leftJoin('interiors', { 'profiles.id': 'interiors.user_id' })
        .leftJoin(function () {
          this.select('interior_id', KnexService.raw('count(interior_models.id) as count'))
            .from('interior_models')
            .groupBy('interior_id')
            .as('interior_models')
        }, { 'interiors.id': 'interior_models.interior_id' })
        .groupBy(
          'profiles.id', "user_roles.id", "user_roles.role_id", "role_name", "roles_id", 'interior_models.count'
        )
        .where({ username })
    )
  }
  async getByUsernameForProfile(username: string, filters: any = {}): Promise<IUser> {

    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*",
          "user_roles.role_id as role.id",
          "role_name as role.name",
          "roles_id as role.id",
        ])
        .innerJoin(function () {
          this.select(["user_roles.id", "user_roles.user_id", "user_roles.role_id", "role.name as role_name", "role.id as roles_id"])
            .from("user_roles")
            .as("user_roles")
            .leftJoin({ role: "roles" }, { "user_roles.role_id": "role.id" })
            .groupBy("user_roles.id", "role.id");
        }, { "profiles.id": "user_roles.user_id" })
        .groupBy(
          'profiles.id', "user_roles.id", "user_roles.role_id", "role_name", "roles_id"
        )
        .where({ username })
    )
  }

  async getByUsername_admin(username: string, filters: any = {}): Promise<IUser> {
    const { downloads_from_brand } = filters;

    return getFirst(
      await KnexService('profiles')
        .select([
          'profiles.*',
          'user_roles.role_id as role.id',
          'role_name as role.name',
          'roles_id as role.id',
          KnexService.raw(`jsonb_agg(distinct user_bans) as bans`),
          // KnexService.raw('COALESCE(interiors.count, 0) as designs_count'),
          // KnexService.raw('COALESCE(interior_models_count, 0) as tags_count'),
          // KnexService.raw('COALESCE(downloads.count, 0) as downloads_count'),
        ])
        .leftJoin('user_bans', function () {
          this.on('user_bans.user_id', '=', 'profiles.id')
            .andOn('user_bans.permanent', KnexService.raw('?', [true]))
        })
        .innerJoin(function () {
          this.select(['user_roles.id', 'user_roles.user_id', 'user_roles.role_id', 'role.name as role_name', 'role.id as roles_id'])
            .from('user_roles')
            .as('user_roles')
            .leftJoin({ role: 'roles' }, { 'user_roles.role_id': 'role.id' })
            .whereNot('role_id', 1)
            .groupBy('user_roles.id', 'role.id');
        }, { 'profiles.id': 'user_roles.user_id' })
        // .leftJoin(function () {
        //   this.select([
        //     'user_id',
        //     'interior_models.count as interior_models_count',
        //     KnexService.raw('count(interiors.id) as count')
        //   ])
        //     .from('interiors')
        //     .groupBy('user_id', 'interior_models.count')
        //     .as('interiors')
        //     .leftJoin(function () {
        //       this.select('interior_id', KnexService.raw('count(interior_models.id) as count'))
        //         .from('interior_models')
        //         .groupBy('interior_id')
        //         .as('interior_models')
        //         .modify(q => {
        //           if (downloads_from_brand) {
        //             q.innerJoin('models', { 'interior_models.model_id': 'models.id' })
        //               .where('models.brand_id', '=', downloads_from_brand)
        //           }
        //         })
        //     }, { 'interiors.id': 'interior_models.interior_id' })
        // }, { 'interiors.user_id': 'profiles.id' })
        // .leftJoin(function () {
        //   this.select('user_id', KnexService.raw('count(downloads.id) as count'))
        //     .from('downloads')
        //     .groupBy('user_id')
        //     .as('downloads')
        //     .modify(q => {
        //       if (downloads_from_brand) {
        //         q.innerJoin('models', { 'downloads.model_id': 'models.id' })
        //           .where('models.brand_id', '=', downloads_from_brand)
        //       }
        //     })
        // }, { 'profiles.id': 'downloads.user_id' })
        .groupBy(
          'profiles.id',
          'user_roles.id', 'user_roles.role_id', 'role_name', 'roles_id',
          // 'interiors.count', 'interiors.interior_models_count', 'downloads.count',
        )
        .where({ username })
    )
  }


  async getByUsername_min(username: string): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*"
        ])
        .where({ username })
    )
  }

  async getByEmail_min(email: string): Promise<IUser> {
    return getFirst(
      await KnexService('profiles')
        .select([
          "profiles.*"
        ])
        .where({ email })
    )
  }

  getVerifiedByEmail(email: string) {
    return KnexService('profiles')
      .select('*')
      .where({ email })
      .innerJoin(function () {
        this.select('id')
          .from('auth.users')
          .as('users')
          .whereNotNull('users.email_confirmed_at')
      }, { 'users.id ': 'profiles.user_id' })
      .first()
  }

  getUnverifiedByEmail(email: string) {
    return KnexService('profiles')
      .select('*')
      .where({ email })
      .innerJoin(function () {
        this.select('id')
          .from('auth.users')
          .as('users')
          .whereNull('users.email_confirmed_at')
      }, { 'users.id ': 'profiles.user_id' })
      .first()
  }

  verify(id: string) {
    return KnexService('auth.users')
      .update({ email_confirmed_at: true })
      .where({ id })
  }

  deleteById(id: string) {
    return KnexService('auth.users')
      .where({ id })
      .delete()
  }
}
