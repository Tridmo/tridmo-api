import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import FormfactorsDAO from "./dao/formfactors.dao";
import { IFormfactor, ICreateFormfactor } from "./interface/formfactors.interface";

export default class FormfactorService {
    private formfactorsDao = new FormfactorsDAO()

    async create({name}: ICreateFormfactor) {
        const foundFormfactor: IFormfactor = await this.formfactorsDao.getByName(name);        
        if (foundFormfactor) {
          throw new ErrorResponse(400, "This formfactor already exists");
        }
        const data: IFormfactor = await this.formfactorsDao.create({ name })
        
        return data
    }

    async update(id: string, values: ICreateFormfactor) {
        const foundFormfactor: IFormfactor = await this.formfactorsDao.getById(id);
        if (isEmpty(foundFormfactor)) {
          throw new ErrorResponse(400, "Formfactor was not found");
        }
        const data: IFormfactor = await this.formfactorsDao.update(id, values)
        
        return data
    }

    async findAll(keyword: string) {
        const data = await this.formfactorsDao.getAll(keyword);
        return data
    }

    async findOne(id: string) {
        const data = await this.formfactorsDao.getById(id);
        if (isEmpty(data)) {
            throw new ErrorResponse(400, "Formfactor was not found");
        }

        return data
    }

    async delete(id: string) {
        await this.formfactorsDao.deleteById(id);
    }
}