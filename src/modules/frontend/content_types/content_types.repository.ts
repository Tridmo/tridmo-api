import KnexService from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import { ICreateFrontendContentType, IFrontendContentType } from "./content_types.interface";
import { Tables } from "../constants";

export class FrontendContentTypesRepository {
  private readonly tableName = Tables.ContentTypes;

  async create(data: ICreateFrontendContentType): Promise<IFrontendContentType> {
    return getFirst(
      await KnexService(this.tableName)
        .insert({ ...data })
        .returning("*")
    );
  }

  async findById(id: string): Promise<IFrontendContentType | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ id })
      .first();
    return record || null;
  }

  async findByName(name: string): Promise<IFrontendContentType | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ name })
      .first();
    return record || null;
  }

  async findAll(): Promise<IFrontendContentType[]> {
    return await KnexService(this.tableName).select("*");
  }

  async update(
    id: string,
    data: Partial<ICreateFrontendContentType>
  ): Promise<IFrontendContentType> {
    return getFirst(
      await KnexService(this.tableName)
        .update(data)
        .where({ id })
        .returning("*")
    );
  }

  async delete(id: string): Promise<IFrontendContentType> {
    return getFirst(
      await KnexService(this.tableName)
        .delete()
        .where({ id })
        .returning("*")
    );
  }
}