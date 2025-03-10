import KnexService from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import { IFrontendPageSection, ICreateFrontendPageSection } from "./page_sections.interface";
import { Tables } from "../constants";

export class FrontendPageSectionsRepository {
  private readonly tableName = Tables.PageSections;

  async create(data: ICreateFrontendPageSection): Promise<IFrontendPageSection> {
    return getFirst(
      await KnexService(this.tableName)
        .insert({ ...data })
        .returning("*")
    );
  }

  async findById(id: string): Promise<IFrontendPageSection | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ id })
      .first();
    return record || null;
  }

  async findByName(name: string): Promise<IFrontendPageSection | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ name })
      .first();
    return record || null;
  }

  async findAll(): Promise<IFrontendPageSection[]> {
    return await KnexService(this.tableName).select("*");
  }

  async update(
    id: string,
    data: Partial<ICreateFrontendPageSection>
  ): Promise<IFrontendPageSection> {
    return getFirst(
      await KnexService(this.tableName)
        .update(data)
        .where({ id })
        .returning("*")
    );
  }

  async delete(id: string): Promise<IFrontendPageSection> {
    return getFirst(
      await KnexService(this.tableName)
        .delete()
        .where({ id })
        .returning("*")
    );
  }
}