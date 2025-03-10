import KnexService from "../../../database/connection";
import { getFirst } from "../../shared/utils/utils";
import { ICreateWebsite, IWebsite } from "./websites.interface";
import { Tables } from "../constants";


export class WebsitesRepository {
  private readonly tableName = Tables.Websites;

  async create(data: ICreateWebsite): Promise<IWebsite> {
    return getFirst(
      await KnexService(this.tableName)
        .insert({ ...data })
        .returning("*")
    );
  }

  async findById(id: string): Promise<IWebsite | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ id })
      .first();
    return record || null;
  }

  async findByName(name: string): Promise<IWebsite | null> {
    const record = await KnexService(this.tableName)
      .select("*")
      .where({ name })
      .first();
    return record || null;
  }

  async findAll(): Promise<IWebsite[]> {
    return await KnexService(this.tableName).select("*");
  }

  async update(id: string, data: Partial<ICreateWebsite>): Promise<IWebsite> {
    return getFirst(
      await KnexService(this.tableName)
        .update(data)
        .where({ id })
        .returning("*")
    );
  }

  async delete(id: string): Promise<IWebsite> {
    return getFirst(
      await KnexService(this.tableName)
        .delete()
        .where({ id })
        .returning("*")
    );
  }
}