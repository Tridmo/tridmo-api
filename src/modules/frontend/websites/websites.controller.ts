import { NextFunction, Response } from "express";
import { WebsitesService } from "./websites.service";
import { CustomRequest } from "../../shared/interface/routes.interface";

export class WebsitesController {
  private readonly service = new WebsitesService();

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const website = await this.service.createWebsite(data);
      res.status(201).json(website);
    } catch (error) {
      next(error);
    }
  }

  public getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const website = await this.service.getWebsiteById(id);
      if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
      }
      res.status(200).json(website);
    } catch (error) {
      next(error);
    }
  }

  public getByName = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params;
      const website = await this.service.getWebsiteByName(name);
      if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
      }
      res.status(200).json(website);
    } catch (error) {
      next(error);
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const websites = await this.service.getAllWebsites();
      res.status(200).json(websites);
    } catch (error) {
      next(error);
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const website = await this.service.updateWebsite(id, data);
      if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
      }
      res.status(200).json(website);
    } catch (error) {
      next(error);
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const website = await this.service.deleteWebsite(id);
      if (!website) {
        res.status(404).json({ message: "Website not found" });
        return;
      }
      res.status(200).json(website);
    } catch (error) {
      next(error);
    }
  }
}