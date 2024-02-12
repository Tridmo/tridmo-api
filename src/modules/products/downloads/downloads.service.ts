import { ICreateDownload } from './interface/product_downloads.interface';
import { IDefaultQuery } from "../../shared/interface/query.interface";  
import DownloadsDao from "./dao/product_downloads.dao";

export default class DownloadsService {
    private downloadsDao = new DownloadsDao()

    async create({ user_id, product_id }: ICreateDownload): Promise<any>{
        const product  = await this.downloadsDao.create({ user_id, product_id })
        return product
    } 

    async deleteByProduct(product_id: string){
        await this.downloadsDao.deleteByProduct(product_id)
    } 

    // async findAll(keyword: string, sorts: IDefaultQuery, categories, styles, colors) {
    //     const products = await this.downloadsDao.getAll(keyword, sorts, categories, styles, colors); 
    //     return products
    // }  
 
}