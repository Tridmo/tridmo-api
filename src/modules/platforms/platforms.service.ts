import PlatformsDAO from './platforms.dao';
import { ICreatePlatform, IFilterPlatforms, IPlatform, IUpdatePlatform } from './platforms.interface';


export default class PlatformsService {
    private dao = new PlatformsDAO();

    async create(values: ICreatePlatform): Promise<IPlatform> {
        return await this.dao.create(values)
    }
    async update(id: string, values: IUpdatePlatform): Promise<IPlatform> {
        return await this.dao.update(id, values)
    }
    async findAll(filters?: IFilterPlatforms): Promise<IPlatform[]> {
        return await this.dao.getAll(filters)
    }
    async findAllModelType(): Promise<IPlatform[]> {
        return await this.dao.getAll({ type: 1 })
    }
    async findAllRenderType(): Promise<IPlatform[]> {
        return await this.dao.getAll({ type: 2 })
    }
    async findOne(id: string): Promise<IPlatform> {
        return await this.dao.getById(id)
    }
    async findByName(name: string): Promise<IPlatform> {
        return await this.dao.getByName(name)
    }
    async delete(id: string): Promise<number> {
        return await this.dao.deleteById(id)
    }
}