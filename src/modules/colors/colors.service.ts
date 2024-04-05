import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import ColorsDAO from "./dao/colors.dao";
import { IColor, ICreateColor } from "./interface/colors.interface";

export default class ColorService {
    private colorsDao = new ColorsDAO()

    async create({ name, hex_value }: ICreateColor) {
        const foundColor: IColor = await this.colorsDao.getByName(name);
        if (foundColor) {
            throw new ErrorResponse(400, "This color already exists");
        }
        const color: IColor = await this.colorsDao.create({
            name,
            hex_value
        })

        return color
    }

    async update(id: number, values: ICreateColor) {
        const foundColor: IColor = await this.colorsDao.getById(id);
        if (isEmpty(foundColor)) {
            throw new ErrorResponse(400, "Color was not found");
        }
        const color: IColor = await this.colorsDao.update(id, values)

        return color
    }

    async findAll(keyword: string = "") {
        const colors = await this.colorsDao.getAll(keyword);
        return colors
    }

    async search(keyword: string) {
        const colors = await this.colorsDao.searchByName(keyword);
        return colors
    }

    async findOne(id: number) {
        const color = await this.colorsDao.getById(id);
        if (!color) {
            throw new ErrorResponse(400, "Color was not found");
        }

        return color
    }

    async findByName(name: string) {
        const color = await this.colorsDao.getByName(name);
        if (isEmpty(color)) {
            throw new ErrorResponse(400, "Color was not found");
        }

        return color
    }

    async delete(id: number) {
        await this.colorsDao.deleteById(id);
    }
}