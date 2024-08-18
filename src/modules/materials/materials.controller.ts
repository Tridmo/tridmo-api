import { NextFunction, Request, Response } from "express";

import MaterialService from "./materials.service";

import { CreateMaterialDTO, UpdateMaterialDTO } from "./materials.dto";
import { ISearchQuery } from "../shared/interface/query.interface";
import { CustomRequest } from "../shared/interface/routes.interface";

export default class MaterialsController {
  private materialsService = new MaterialService()

  public create = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialData: CreateMaterialDTO = req.body
      const data = await this.materialsService.create(materialData)

      res.status(201).json({
        success: true,
        data,
        message: req.t.created_successfully()
      })
    } catch (error) {
      next(error)
    }
  }

  public update = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const materialData: UpdateMaterialDTO = req.body
      const { id } = req.params
      const data = await this.materialsService.update(Number(id), materialData)

      res.status(200).json({
        success: true,
        data,
        message: req.t.saved_successfully()
      })
    } catch (error) {
      next(error)
    }
  }

  public getAll = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req
      const { keyword }: ISearchQuery = query
      const data = await this.materialsService.findAll(keyword)

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public getOne = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const data = await this.materialsService.findOne(Number(id))

      res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      next(error)
    }
  }

  public delete = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      await this.materialsService.delete(Number(id))

      res.status(200).json({
        success: true,
        message: req.t.deleted_successfully()
      })
    } catch (error) {
      next(error)
    }
  }
}