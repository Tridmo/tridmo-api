import { ICreateFrontendPageSection, IFrontendPageSection } from "./page_sections.interface";
import { FrontendPageSectionsRepository } from "./page_sections.repository";

export class PageSectionsService {
  async createPageSection(data: ICreateFrontendPageSection): Promise<IFrontendPageSection> {
    return await new FrontendPageSectionsRepository().create(data);
  }

  async getPageSectionById(id: string): Promise<IFrontendPageSection | null> {
    return await new FrontendPageSectionsRepository().findById(id);
  }

  async getPageSectionByName(name: string): Promise<IFrontendPageSection | null> {
    return await new FrontendPageSectionsRepository().findByName(name);
  }

  async getAllPageSections(): Promise<IFrontendPageSection[]> {
    return await new FrontendPageSectionsRepository().findAll();
  }

  async updatePageSection(
    id: string,
    data: Partial<ICreateFrontendPageSection>
  ): Promise<IFrontendPageSection> {
    return await new FrontendPageSectionsRepository().update(id, data);
  }

  async deletePageSection(id: string): Promise<IFrontendPageSection> {
    return await new FrontendPageSectionsRepository().delete(id);
  }
}

export default new PageSectionsService();
