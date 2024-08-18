import { NextFunction, Request, Response } from "express";
import { ISearchQuery } from "../shared/interface/query.interface";
import DownloadsService from "./downloads.service";
import { CreateFormfactorDTO, UpdateFormfactorDTO } from "../formfactors/dto/formfactors.dto";
import extractQuery from "../shared/utils/extractQuery";
import buildPagination from "../shared/utils/paginationBuilder";

export default class DonwloadsController {
  private service = new DownloadsService()

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filters, sorts } = extractQuery(req.query)
      const data = await this.service.findWithModelBy(filters, sorts)

      const count = await this.service.count(filters)

      res.status(200).json({
        success: true,
        data: {
          downloads: data,
          pagination: buildPagination(count, sorts)
        }
      })
    } catch (error) {
      next(error)
    }
  }

}