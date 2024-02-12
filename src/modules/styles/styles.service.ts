import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import StylesDAO from "./dao/styles.dao";
import { IStyle, ICreateStyle } from "./interface/styles.interface";

export default class StyleService {
    private stylesDao = new StylesDAO()

    async create({name}: ICreateStyle) {
        const foundStyle: IStyle = await this.stylesDao.getByName(name);        
        if (foundStyle) {
          throw new ErrorResponse(400, "This style already exists");
        }
        const data: IStyle = await this.stylesDao.create({ name })
        
        return data
    }

    async update(id: number, values: ICreateStyle) {
        const foundStyle: IStyle = await this.stylesDao.getById(id);
        if (isEmpty(foundStyle)) {
          throw new ErrorResponse(400, "Style was not found");
        }
        const data: IStyle = await this.stylesDao.update(id, values)
        
        return data
    }

    async findAll(keyword: string = "") {
        const data = await this.stylesDao.getAll(keyword);
        return data
    }

    async findOne(id: number) {
        const data = await this.stylesDao.getById(id);
        if (isEmpty(data)) {
            throw new ErrorResponse(400, "Style was not found");
        }

        return data
    }

    async findByName(name: string) {
        const data = await this.stylesDao.getByName(name);
        if (isEmpty(data)) {
            throw new ErrorResponse(400, "Style was not found");
        }

        return data
    }

    async delete(id: number) {
        await this.stylesDao.deleteById(id);
    }
}