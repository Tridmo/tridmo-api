import { IAccessModule, ICreateRoleAccessModule } from './interface/access_modules.interface';
import AccessModulesDAO from './dao/access_modules.dao';

export default class AccessModuleService {
    private accessModulesDao = new AccessModulesDAO()

    async createRoleAccessModule({ access_module_id, role_id }: ICreateRoleAccessModule) {   
        const data: IAccessModule = await this.accessModulesDao.createRoleAccessModule({
            access_module_id, role_id
        })

        return data
    } 

    async getAll() {
        const data = await this.accessModulesDao.getAll();
        return data
    } 
}