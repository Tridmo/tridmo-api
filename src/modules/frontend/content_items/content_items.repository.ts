import KnexService from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import {
  ICreateFrontendContentItem,
  IFrontendContentItem,
  IFilterFrontendContentItem
} from "./content_items.interface";
import { Tables } from "../constants";

export class FrontendContentItemsRepository {
  private readonly tableName = Tables.ContentItems;
  private readonly websitesTableName = Tables.Websites;
  private readonly contentTypesTableName = Tables.ContentTypes;
  private readonly pageSectionsTableName = Tables.PageSections;

  async create(data: ICreateFrontendContentItem): Promise<IFrontendContentItem> {
    return getFirst(
      await KnexService(this.tableName)
        .insert({ ...data })
        .returning("*")
    );
  }

  async findById(id: string): Promise<IFrontendContentItem | null> {
    const record = await KnexService(this.tableName)
      .select([
        `${this.tableName}.*`,
        `${this.websitesTableName}.id as website.id`,
        `${this.websitesTableName}.name as website.name`,
        `${this.websitesTableName}.domain as website.domain`,
        `${this.contentTypesTableName}.id as type.id`,
        `${this.contentTypesTableName}.name as type.name`,
        `${this.contentTypesTableName}.display_name as type.display_name`,
        `${this.pageSectionsTableName}.id as section.id`,
        `${this.pageSectionsTableName}.name as section.name`,
        `${this.pageSectionsTableName}.display_name as section.display_name`,
      ])
      .join(this.websitesTableName, { [`${this.websitesTableName}.id`]: `${this.tableName}.website_id` })
      .join(this.contentTypesTableName, { [`${this.contentTypesTableName}.id`]: `${this.tableName}.type_id` })
      .join(this.pageSectionsTableName, { [`${this.pageSectionsTableName}.id`]: `${this.tableName}.section_id` })
      .where({ [`${this.tableName}.id`]: id })
      .groupBy(
        `${this.tableName}.id`,
        `${this.websitesTableName}.id`,
        `${this.contentTypesTableName}.id`,
        `${this.pageSectionsTableName}.id`,
      )
      .first();
    return record || null;
  }

  async findAll(filters?: IFilterFrontendContentItem): Promise<IFrontendContentItem[]> {
    const { type, website, section, type_id, website_id, section_id } = filters || {};

    return await KnexService(this.tableName)
      .select(`${this.tableName}.*`)
      .orderBy(`${this.tableName}.created_at`, 'asc')
      .modify(q => {
        if (type_id) q.where(`${this.tableName}.type_id`, '=', type_id);
        if (website_id) q.where(`${this.tableName}.website_id`, '=', website_id);
        if (section_id) q.where(`${this.tableName}.section_id`, '=', section_id);

        if (type) {
          q.innerJoin(
            this.contentTypesTableName,
            { [`${this.tableName}.type_id`]: `${this.contentTypesTableName}.id` }
          ).where(`${this.contentTypesTableName}.name`, '=', type);
        }

        if (website) {
          q.innerJoin(
            this.websitesTableName,
            { [`${this.tableName}.website_id`]: `${this.websitesTableName}.id` }
          ).where(`${this.websitesTableName}.name`, '=', website);
        }

        if (section) {
          q.innerJoin(
            this.pageSectionsTableName,
            { [`${this.tableName}.section_id`]: `${this.pageSectionsTableName}.id` }
          ).where(`${this.pageSectionsTableName}.name`, '=', section);
        }
      });
  }


  async update(
    id: string,
    data: Partial<ICreateFrontendContentItem>
  ): Promise<IFrontendContentItem> {
    return getFirst(
      await KnexService(this.tableName)
        .update(data)
        .where({ id })
        .returning("*")
    );
  }

  async delete(id: string): Promise<IFrontendContentItem> {
    return getFirst(
      await KnexService(this.tableName)
        .delete()
        .where({ id })
        .returning("*")
    );
  }
}