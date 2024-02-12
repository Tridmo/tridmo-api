import { NextFunction, Request, Response } from 'express'; 
import AccessModuleService from './access_modules.service';

class AccessModulesController {
  public accessModulesService = new AccessModuleService(); 
  
  public getAll = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        
        const data = await this.accessModulesService.getAll();

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }
}


}

export default AccessModulesController;