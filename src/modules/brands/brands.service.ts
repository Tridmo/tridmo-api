import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import BrandsDAO from "./dao/brands.dao";
import { IBrand, IBrandAuth, ICreateBrand, IGetBrandsQuery } from "./interface/brands.interface";
import ModelService from "../models/models.service";
import { uploadFile } from "../shared/utils/fileUpload";
import { IImage, IRequestFile } from "../shared/interface/files.interface";
import { s3Vars } from "../../config/conf";
import ImageService from "../shared/modules/images/images.service";
import AuthService from "../auth/auth.service";
import { IUser } from "../users/interface/users.interface";
import UsersService from "../users/users.service";
import generateSlug from '../shared/utils/generateSlug';

export default class BrandService {
    private brandsDao = new BrandsDAO()
    private modelsService = new ModelService()
    private imagesService = new ImageService()
    private authService = new AuthService()
    private usersService = new UsersService()

    async create(
        { name, site_link, description, username, password, phone, email, address }: ICreateBrand & IBrandAuth,
        brand_image: IRequestFile
    ): Promise<{
        brand: IBrand,
        admin: IUser
    }> {

        const foundBrand: IBrand = await this.brandsDao.getByName(name);
        if (foundBrand) throw new ErrorResponse(400, "This brand already exists");

        // generate unique slug
        const slug = generateSlug(name, { replacement: "", lower: false })

        const admin = await this.authService.createVerifiedUser({
            email: `admin@${name.toLowerCase()}.com`,
            full_name: `${name} admin`,
            birth_date: new Date(),
            username,
            password
        })

        const brand: IBrand = await this.brandsDao.create({
            name,
            slug,
            phone,
            email,
            address,
            site_link,
            description
        })

        const imageUpdate = await this.updateImage(brand.id, brand_image)

        const brandAdmin = await this.brandsDao.createBrandAdmin({
            brand_id: brand.id,
            profile_id: admin.id
        })

        return {
            brand: imageUpdate,
            admin: admin
        }
    }

    async update(brand_id: string, values: ICreateBrand, brand_image?: IRequestFile): Promise<IBrand> {
        const foundBrand: IBrand = await this.brandsDao.getById(brand_id);
        if (isEmpty(foundBrand)) throw new ErrorResponse(400, "Brand was not found");

        const brand: IBrand = Object.keys(values).length ? await this.brandsDao.update(brand_id, values) : foundBrand

        if (brand_image) {
            const imageUpdate = await this.updateImage(brand.id, brand_image);
            return imageUpdate;
        }

        return brand
    }

    async updateImage(brand_id: string, image: IRequestFile): Promise<IBrand> {
        const brand: IBrand = await this.brandsDao.getById(brand_id);
        if (isEmpty(brand)) throw new ErrorResponse(400, "Brand was not found");

        if (brand.image_id) {
            const image_id = brand.image_id
            await this.brandsDao.update(brand_id, { image_id: null })
            await this.imagesService.delete(brand.image_id);
        }

        const upload = await uploadFile(image, "images/brands", s3Vars.imagesBucket)
        const newImage = await this.imagesService.create(upload[0])

        const imageUpdate: IBrand = await this.brandsDao.update(brand_id, {
            image_id: newImage.id
        })

        return imageUpdate
    }

    async findAll(filters: IGetBrandsQuery, sorts: IDefaultQuery): Promise<IBrand[]> {
        const brands = await this.brandsDao.getAll(filters, sorts);
        return brands
    }

    async count(filters): Promise<number> {
        return await this.brandsDao.count(filters);
    }

    async findOne(identifier: string): Promise<IBrand> {
        const brand = await this.brandsDao.getBySlugOrId(identifier);
        if (!brand) throw new ErrorResponse(404, "Brand was not found");

        if (brand.styles && !brand.styles[0]) {
            brand.styles = []
        }

        return brand
    }

    async delete(brand_id: string): Promise<void> {
        const brand = await this.brandsDao.getById(brand_id);
        if (!brand) throw new ErrorResponse(404, "Brand was not found")

        // disconnect models
        await this.modelsService.updateByBrand(brand_id, { brand_id: null })

        // find brand admins and delete them
        const admins = await this.brandsDao.getBrandAdminsByBrand(brand_id)
        Promise.all(admins.map(async a => await this.usersService.deleteByUserId(a['user_id'])))

        // delete brand
        await this.brandsDao.deleteById(brand_id);

        // delete brand image
        await this.imagesService.delete(brand.image_id)
    }
}