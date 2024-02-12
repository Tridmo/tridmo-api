import {  ICreateRoleAccessModule } from '../interface/access_modules.interface';
 
import KnexService from '../../../../database/connection'; 
import { getFirst } from '../../../shared/utils/utils';

export default class AccessModulesDAO {

    async createRoleAccessModule({ access_module_id, role_id }: ICreateRoleAccessModule) {
        return getFirst(
            await KnexService('role_access_modules')
            .insert({
                access_module_id, 
                role_id
            })
            .returning('*')
        )
    }  

    async getAll() {
        return await KnexService('access_modules')
    }  
}