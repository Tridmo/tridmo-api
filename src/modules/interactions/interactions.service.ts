import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import { IInteraction, IUpdateInteraction } from "./interface/interactions.interface";
import InteractionsDAO from './dao/interactions.dao';

export default class InteractionService {
    private interactionsDao = new InteractionsDAO()

    async create() {
        const data: IInteraction = await this.interactionsDao.create()
        return data
    }

    async update(id: string, values: IUpdateInteraction) {
        const data: IInteraction = await this.interactionsDao.update(id, values)
        return data
    }

    async findOne(id: string) {
        const data = await this.interactionsDao.getById(id);
        return data
    }

    async delete(id: string) {
        await this.interactionsDao.deleteById(id);
    }
}