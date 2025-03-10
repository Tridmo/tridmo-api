import { ICreateFrontendContentType, IFrontendContentType } from "./content_types.interface";
import { FrontendContentTypesRepository } from "./content_types.repository";

export class ContentTypesService {
  async createContentType(data: ICreateFrontendContentType): Promise<IFrontendContentType> {
    return await new FrontendContentTypesRepository().create(data);
  }

  async getContentTypeById(id: string): Promise<IFrontendContentType | null> {
    return await new FrontendContentTypesRepository().findById(id);
  }

  async getContentTypeByName(name: string): Promise<IFrontendContentType | null> {
    return await new FrontendContentTypesRepository().findByName(name);
  }

  async getAllContentTypes(): Promise<IFrontendContentType[]> {
    return await new FrontendContentTypesRepository().findAll();
  }

  async updateContentType(
    id: string,
    data: Partial<ICreateFrontendContentType>
  ): Promise<IFrontendContentType> {
    return await new FrontendContentTypesRepository().update(id, data);
  }

  async deleteContentType(id: string): Promise<IFrontendContentType> {
    return await new FrontendContentTypesRepository().delete(id);
  }
}

export default new ContentTypesService();
