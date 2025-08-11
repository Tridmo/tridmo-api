import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import CostsDAO from "./dao/costs.dao";
import { ICost, ICreateCost } from "./interface/costs.interface";
import logger from "../../lib/logger";

export default class CostService {
    private costsDao = new CostsDAO()

    async create({amount}: ICreateCost) {
        logger.info('Creating new cost entry', { amount });

        const data: ICost = await this.costsDao.create({
            amount
        })
        
        logger.info('Cost entry created successfully', { 
            costId: data.id, 
            amount: data.amount 
        });
        
        return data
    }

    async update(id: string, values: ICreateCost) {
        logger.info('Updating cost entry', { 
            costId: id, 
            newAmount: values.amount 
        });

        const foundCost: ICost = await this.costsDao.getById(id);
        if (isEmpty(foundCost)) {
          logger.warn('Cost update failed - cost not found', { costId: id });
          throw new ErrorResponse(400, "Cost was not found");
        }

        const data: ICost = await this.costsDao.update(id, values)
        
        logger.info('Cost entry updated successfully', { 
            costId: id, 
            oldAmount: foundCost.amount, 
            newAmount: data.amount 
        });
        
        return data
    }

    async findAll(filters: IDefaultQuery, sorts: IDefaultQuery) {
        logger.debug('Fetching all cost entries', { 
            filterKeys: Object.keys(filters || {}),
            sortKeys: Object.keys(sorts || {}) 
        });

        const brands = await this.costsDao.getAll(filters, sorts);
        
        logger.debug('Cost entries fetched', { count: brands?.length || 0 });
        
        return brands
    }

    async findOne(id: string) {
        logger.debug('Fetching cost entry by ID', { costId: id });

        const data = await this.costsDao.getById(id);
        if (isEmpty(data)) {
            logger.warn('Cost entry not found', { costId: id });
            throw new ErrorResponse(400, "Cost was not found");
        }

        return data
    }
}