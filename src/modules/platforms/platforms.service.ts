import PlatformsDAO from './platforms.dao';
import { ICreatePlatform, IPlatform, IUpdatePlatform } from './platforms.interface';


export default class PlatformsService {
    private dao = new PlatformsDAO();

    async create(values: ICreatePlatform): Promise<IPlatform> {
        return await this.dao.create(values)
    }
    async update(id: string, values: IUpdatePlatform): Promise<IPlatform> {
        return await this.dao.update(id, values)
    }
    async findAllModelType(keyword?: string): Promise<IPlatform> {
        return await this.dao.getAllModelType(keyword)
    }
    async findAllRenderType(keyword?: string): Promise<IPlatform> {
        return await this.dao.getAllRenderType(keyword)
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