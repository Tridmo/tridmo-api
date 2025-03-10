import { NextFunction, Response } from "express";
import { CustomRequest } from "../../shared/interface/routes.interface";
import { ContentItemsService } from "./content_items.service";
import { UploadedFile } from "express-fileupload";
import { defaults } from "../../shared/defaults/defaults";

export class ContentItemsController {
  private readonly service = new ContentItemsService();

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const contentItem = await this.service.createContentItem(data, {
        desktop_image: req.files[defaults.reqDesktopImageName] as UploadedFile,
        tablet_image: req.files[defaults.reqTabletImageName] as UploadedFile,
        mobile_image: req.files[defaults.reqMobileImageName] as UploadedFile,
      });
      res.status(201).json(contentItem);
    } catch (error) {
      next(error);
    }
  }

  public getById = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contentItem = await this.service.getContentItemById(id);
      if (!contentItem) {
        res.status(404).json({ message: "Content Item not found" });
        return;
      }
      res.status(200).json(contentItem);
    } catch (error) {
      next(error);
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query;
      const contentItems = await this.service.getAllContentItems(filters as any);
      res.status(200).json(contentItems);
    } catch (error) {
      next(error);
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const contentItem = await this.service.updateContentItem(id, data, req.files && {
        desktop_image: req.files[defaults.reqDesktopImageName] as UploadedFile,
        tablet_image: req.files[defaults.reqTabletImageName] as UploadedFile,
        mobile_image: req.files[defaults.reqMobileImageName] as UploadedFile,
      });
      if (!contentItem) {
        res.status(404).json({ message: "Content Item not found" });
        return;
      }
      res.status(200).json({
        success: true,
        message: req.t.saved_successfully(),
        data: contentItem
      });
    } catch (error) {
      next(error);
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const contentItem = await this.service.deleteContentItem(id);
      if (!contentItem) {
        res.status(404).json({ message: "Content Item not found" });
        return;
      }
      res.status(200).json(contentItem);
    } catch (error) {
      next(error);
    }
  }
}