import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import RolesDAO from "./roles.dao";
import { ICreateRole, IRole, IUpdateRole } from "./roles.interface";

export default class RoleService {
    private rolesDao = new RolesDAO()

    async create({id, name, description}: ICreateRole) {
        const foundRole: IRole = await this.rolesDao.getByName(name);        
        if (foundRole) {
          throw new ErrorResponse(400, "This role already exists");
        }
        const data: IRole = await this.rolesDao.create({ id, name, description })
        
        return data
    }

    async update(id: number, values: IUpdateRole) {
        const foundRole: IRole = await this.rolesDao.getById(id);
        if (isEmpty(foundRole)) {
          throw new ErrorResponse(400, "Role was not found");
        }
        const data: IRole = await this.rolesDao.update(id, values)
        
        return data
    }

    async findAll() {
        const data = await this.rolesDao.getAll();
        return data
    }

    async findOne(id: number) {
        const data = await this.rolesDao.getById(id);
        if (!data) {
            throw new ErrorResponse(400, "Role was not found");
        }

        return data
    }

    async findByName(name: string) {
        const data = await this.rolesDao.getByName(name);
        if (!data) {
            throw new ErrorResponse(400, "Role was not found");
        }

        return data
    }
}