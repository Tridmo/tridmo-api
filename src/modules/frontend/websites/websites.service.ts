import { ICreateWebsite, IWebsite } from "./websites.interface";
import { WebsitesRepository } from "./websites.repository";

export class WebsitesService {
  async createWebsite(data: ICreateWebsite): Promise<IWebsite> {
    return await new WebsitesRepository().create(data);
  }

  async getWebsiteById(id: string): Promise<IWebsite | null> {
    return await new WebsitesRepository().findById(id);
  }

  async getWebsiteByName(name: string): Promise<IWebsite | null> {
    return await new WebsitesRepository().findByName(name);
  }

  async getAllWebsites(): Promise<IWebsite[]> {
    return await new WebsitesRepository().findAll();
  }

  async updateWebsite(id: string, data: Partial<ICreateWebsite>): Promise<IWebsite> {
    return await new WebsitesRepository().update(id, data);
  }

  async deleteWebsite(id: string): Promise<IWebsite> {
    return await new WebsitesRepository().delete(id);
  }
}

export default new WebsitesService();
