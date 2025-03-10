import { NextFunction, Response } from "express";
import { PageSectionsService } from "./page_sections.service";
import { CustomRequest } from "../../shared/interface/routes.interface";

export class PageSectionsController {
  private readonly service = new PageSectionsService();

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const pageSection = await this.service.createPageSection(data);
      res.status(201).json(pageSection);
    } catch (error) {
      next(error);
    }
  }

  public getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pageSection = await this.service.getPageSectionById(id);
      if (!pageSection) {
        res.status(404).json({ message: "Page Section not found" });
        return;
      }
      res.status(200).json(pageSection);
    } catch (error) {
      next(error);
    }
  }

  public getByName = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const pageSection = await this.service.getPageSectionByName(name);
      if (!pageSection) {
        res.status(404).json({ message: "Page Section not found" });
        return;
      }
      res.status(200).json(pageSection);
    } catch (error) {
      next(error);
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pageSections = await this.service.getAllPageSections();
      res.status(200).json(pageSections);
    } catch (error) {
      next(error);
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const pageSection = await this.service.updatePageSection(id, data);
      if (!pageSection) {
        res.status(404).json({ message: "Page Section not found" });
        return;
      }
      res.status(200).json(pageSection);
    } catch (error) {
      next(error);
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const pageSection = await this.service.deletePageSection(id);
      if (!pageSection) {
        res.status(404).json({ message: "Page Section not found" });
        return;
      }
      res.status(200).json(pageSection);
    } catch (error) {
      next(error);
    }
  }
}
