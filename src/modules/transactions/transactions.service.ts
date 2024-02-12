import TransactionsDAO from "./dao/transactions.dao";
import { ICreateTransaction, ITransaction } from "./interface/transactions.interface";

export default class TransactionService { 
    private transactionsDao = new TransactionsDAO()
    async create (data: ICreateTransaction): Promise<ITransaction> {
        return await this.transactionsDao.create(data)
    } 

    
    async getById(id: string) {
        const data = await this.transactionsDao.getById(id);
        return data
    } 

    async update(id: string, values) { 
        const data = await this.transactionsDao.update(id, values)
        
        return data
    }


}