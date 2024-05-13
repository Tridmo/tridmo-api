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

  async increment(id: string, column: keyof IUpdateInteraction) {
    const data: IInteraction = await this.interactionsDao.increment(id, column)
    return data
  }

  async decrement(id: string, column: keyof IUpdateInteraction) {
    const data: IInteraction = await this.interactionsDao.decrement(id, column)
    return data
  }

  async findOne(id: string): Promise<IInteraction> {
    const data = await this.interactionsDao.getById(id);
    return data
  }

  async delete(id: string) {
    await this.interactionsDao.deleteById(id);
  }
}