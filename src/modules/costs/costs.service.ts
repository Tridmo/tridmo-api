import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import CostsDAO from "./dao/costs.dao";
import { ICost, ICreateCost } from "./interface/costs.interface";

export default class CostService {
    private costsDao = new CostsDAO()

    async create({amount}: ICreateCost) {
        const data: ICost = await this.costsDao.create({
            amount
        })
        
        return data
    }

    async update(id: string, values: ICreateCost) {
        const foundCost: ICost = await this.costsDao.getById(id);
        if (isEmpty(foundCost)) {
          throw new ErrorResponse(400, "Cost was not found");
        }
        const data: ICost = await this.costsDao.update(id, values)
        
        return data
    }

    async findAll(filters: IDefaultQuery, sorts: IDefaultQuery) {
        const brands = await this.costsDao.getAll(filters, sorts);
        return brands
    }

    async findOne(id: string) {
        const data = await this.costsDao.getById(id);
        if (isEmpty(data)) {
            throw new ErrorResponse(400, "Cost was not found");
        }

        return data
    }
}