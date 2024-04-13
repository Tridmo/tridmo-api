import { isEmpty } from "lodash";
import ErrorResponse from "../shared/utils/errorResponse";
import CategoriesDAO from "./dao/categories.dao";
import { UpdateCategoryDTO } from "./dto/categories.dto";
import { ICategory, ICreateCategory, IGetCategoriesQuery } from "./interface/categories.interface";
import { IDefaultQuery } from '../shared/interface/query.interface';

export default class CategoryService {
    private categoriesDao = new CategoriesDAO()

    async create({ name, description, parent_id, type }: ICreateCategory) {
        const foundCategory = await this.categoriesDao.getByNameAndParent(name, parent_id || null);
        if (foundCategory) {
            throw new ErrorResponse(400, "This category already exists");
        }

        const category: ICategory = await this.categoriesDao.create({
            name,
            description,
            parent_id,
            type
        })

        return category
    }

    async update(id: string | number, values: UpdateCategoryDTO) {
        const foundCategory = await this.categoriesDao.getById(id);
        if (isEmpty(foundCategory)) {
            throw new ErrorResponse(400, "Category was not found");
        }
        const category: ICategory = await this.categoriesDao.update(id, values)

        return category
    }

    async findAll(filters?) {
        const categories = await this.categoriesDao.getAll(filters);
        return categories
    }

    async findAllParents(filters?, sorts?: IDefaultQuery) {
        const categories = await this.categoriesDao.getParents(filters, sorts);
        return categories
    }

    async findAllChildren() {
        const categories = await this.categoriesDao.getChildren();
        return categories
    }


    async findChildren(parent_id: string | number) {
        const categories = await this.categoriesDao.getByParent(parent_id);
        return categories
    }

    async findOne(id: string | number) {
        const category: ICategory = await this.categoriesDao.getById(id);
        return category
    }

    async findByName(name: string) {
        const category: ICategory = await this.categoriesDao.getByName(name);
        return category
    }

    async delete(id: string | number) {
        await this.categoriesDao.deleteById(id);
    }
}