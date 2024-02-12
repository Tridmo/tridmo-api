import RolesService from './roles.service';
import { NextFunction, Request, Response } from 'express'; 
import AccessModuleService from '../access_modules/access_modules.service';

class RolesController {
    public rolesService = new RolesService(); 
    public accessModulesService = new AccessModuleService()

    public getAll = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        
        const data = await this.rolesService.getAll();

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }  } 

    public createRoleAccessModule = async (req: Request, res: Response, next: NextFunction): Promise<void> =>  {
        const { access_module_id, role_id } = req.body;

        const data = await this.accessModulesService.createRoleAccessModule({role_id, access_module_id})

        res.status(200).json({
            success: true,
            data
        })
    }
}

export default RolesController;