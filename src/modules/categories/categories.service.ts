import { isEmpty } from "lodash";
import ErrorResponse from "../shared/utils/errorResponse";
import CategoriesDAO from "./categories.dao";
import { UpdateCategoryDTO } from "./categories.dto";
import { ICategory, ICreateCategory, IGetCategoriesQuery } from "./categories.interface";
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
    for (let i = 0; i < categories.length; i++) {
      if (categories[i]?.children && (!categories[i]?.children[0] || categories[i]?.children[0] == null)) {
        categories[i].children = []
      }
    }
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

  async findByBrand(brand_id: string): Promise<ICategory[]> {
    const categories = await this.categoriesDao.getByBrand(brand_id);
    return categories
  }

  async delete(id: string | number, cascade?: boolean) {

    if (cascade) {
      await this.categoriesDao.deleteByParent(id)
    } else {
      await this.categoriesDao.updateByParent(id, { parent_id: null })
    }

    await this.categoriesDao.deleteById(id);
  }
}