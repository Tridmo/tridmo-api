import { ICreateDownload } from './../interface/product_downloads.interface';
import KnexService from '../../../../database/connection';
import { getFirst } from "../../../shared/utils/utils"; 

export default class DownloadsDao {
    async create({ user_id, product_id } :ICreateDownload) {
        return getFirst(
            await KnexService("downloads")
            .insert({
                user_id,
                product_id
            })
            .returning("*")
        ) 
    } 

    async deleteByProduct(product_id: string) {
        return await KnexService('downloads')
            .where({product_id})
            .delete()
    }
 
}