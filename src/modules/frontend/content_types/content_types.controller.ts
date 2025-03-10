import { NextFunction, Response } from "express";
import { ContentTypesService } from "./content_types.service";
import { CustomRequest } from "../../shared/interface/routes.interface";

export class ContentTypesController {
  private readonly service = new ContentTypesService();

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const contentType = await this.service.createContentType(data);
      res.status(201).json(contentType);
    } catch (error) {
      next(error);
    }
  }

  public getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contentType = await this.service.getContentTypeById(id);
      if (!contentType) {
        res.status(404).json({ message: "Content Type not found" });
        return;
      }
      res.status(200).json(contentType);
    } catch (error) {
      next(error);
    }
  }

  public getByName = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const contentType = await this.service.getContentTypeByName(name);
      if (!contentType) {
        res.status(404).json({ message: "Content Type not found" });
        return;
      }
      res.status(200).json(contentType);
    } catch (error) {
      next(error);
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contentTypes = await this.service.getAllContentTypes();
      res.status(200).json(contentTypes);
    } catch (error) {
      next(error);
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const contentType = await this.service.updateContentType(id, data);
      if (!contentType) {
        res.status(404).json({ message: "Content Type not found" });
        return;
      }
      res.status(200).json(contentType);
    } catch (error) {
      next(error);
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contentType = await this.service.deleteContentType(id);
      if (!contentType) {
        res.status(404).json({ message: "Content Type not found" });
        return;
      }
      res.status(200).json(contentType);
    } catch (error) {
      next(error);
    }
  }
}