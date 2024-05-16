import UserProductViewsDAO from "./user_product_views.dao";
import { IUserProductView, ICreateUserProductView, IGetUserProductViewFilters } from "./user_product_views.interface";

export default class UserProductViewService {
  private userProductViewsDao = new UserProductViewsDAO()

  async create(values: ICreateUserProductView) {
    const data: IUserProductView = await this.userProductViewsDao.create(values);
    return data
  }

  async deleteByProduct(product_id: string) {
    await this.userProductViewsDao.deleteByProduct(product_id)
  }

  async findAll(filters: IGetUserProductViewFilters) {
    const data = await this.userProductViewsDao.getAll(filters);
    return data
  }


  async findOneByFilters(filters: IGetUserProductViewFilters) {
    const data = await this.userProductViewsDao.findOneByFilters(filters);
    return data
  }

  async findByIPDeviceAndProduct({ remote_ip, device, product_id }) {
    const data = await this.userProductViewsDao.getByIPDeviceAndProduct({ remote_ip, device, product_id });
    return data
  }

  async findWithLimit(limit: number, filters: IGetUserProductViewFilters) {
    const data = await this.userProductViewsDao.getWithLimit(limit, filters);
    return data
  }
}