import { isEmpty } from "class-validator";
import ErrorResponse from "../shared/utils/errorResponse";
import StylesDAO from "./styles.dao";
import { IStyle, ICreateStyle } from "./styles.interface";
import { reqT } from "../shared/utils/language";

export default class StyleService {
  private stylesDao = new StylesDAO()

  async create(values: ICreateStyle) {
    const foundStyle: IStyle = await this.stylesDao.getByName(values.name);
    if (foundStyle) {
      throw new ErrorResponse(400, reqT('same_name_exists'));
    }
    const data: IStyle = await this.stylesDao.create(values)

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