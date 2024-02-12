import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import BrandsDAO from "./dao/brands.dao";
import { IBrand, ICreateBrand } from "./interface/brands.interface";
import ModelService from "../models/models.service";
import { uploadFile } from "../shared/utils/fileUpload";
import { IImage } from "../shared/interface/files.interface";
import { s3Vars } from "config/conf";
import { fileDefaults } from "../shared/defaults/defaults";
import ImageService from "../shared/modules/images/images.service";

export default class BrandService {
    private brandsDao = new BrandsDAO()
    private modelsService = new ModelService()
    private imagesService = new ImageService()

    async create({ name, site_link, description }: ICreateBrand, brand_image: IImage) {

        const foundBrand: IBrand = await this.brandsDao.getByName(name);
        if (foundBrand) throw new ErrorResponse(400, "This brand already exists");

        const upload = await uploadFile(brand_image, "images/brands", s3Vars.imagesBucket)
        const image = await this.imagesService.create({ ...upload[0] })

        const brand: IBrand = await this.brandsDao.create({
            name,
            site_link,
            description,
            image_id: image.id
        })

        return brand
    }

    async update(id: number, values: ICreateBrand) {
        const foundBrand: IBrand = await this.brandsDao.getById(id);
        if (isEmpty(foundBrand)) {
            throw new ErrorResponse(400, "Brand was not found");
        }
        const brand: IBrand = await this.brandsDao.update(id, values)

        return brand
    }

    async findAll(keyword: string, filters: IDefaultQuery, sorts: IDefaultQuery) {
        const brands = await this.brandsDao.getAll(keyword, filters, sorts);
        return brands
    }

    async count() {
        const data = await this.brandsDao.count();
        return data[0] ? Number(data[0].count) : 0
    }

    async findOne(id: number) {
        const brand = await this.brandsDao.getById(id);
        if (isEmpty(brand)) {
            throw new ErrorResponse(400, "Brand was not found");
        }

        return brand
    }

    async delete(id: number) {
        await this.modelsService.updateByBrand(id, { brand_id: null })
        await this.brandsDao.deleteById(id);
    }
}