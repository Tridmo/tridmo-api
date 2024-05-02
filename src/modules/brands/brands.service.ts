import { isEmpty } from "class-validator";
import { IDefaultQuery, ISearchQuery } from "../shared/interface/query.interface";
import ErrorResponse from "../shared/utils/errorResponse";
import BrandsDAO from "./dao/brands.dao";
import { IBrand, IBrandAuth, ICreateBrand, IGetBrandsQuery, IUpdateBrand } from "./interface/brands.interface";
import ModelService from "../models/models.service";
import { uploadFile } from "../shared/utils/fileUpload";
import { IImage, IRequestFile } from "../shared/interface/files.interface";
import { s3Vars } from "../../config/conf";
import ImageService from "../shared/modules/images/images.service";
import AuthService from "../auth/auth.service";
import { IUser } from "../users/interface/users.interface";
import UsersService from "../users/users.service";
import generateSlug from '../shared/utils/generateSlug';
import { reqT } from '../shared/utils/language';
import supabase from "../../database/supabase/supabase";

export default class BrandService {
  private brandsDao = new BrandsDAO()
  private modelsService = new ModelService()
  private imagesService = new ImageService()
  private authService = new AuthService()
  private usersService = new UsersService()

  async create(
    { name, site_link, description, username, password, phone, email, address, styles }: ICreateBrand & IBrandAuth,
    brand_image: IRequestFile
  ): Promise<{
    brand: IBrand,
    admin: IUser
  }> {

    const foundBrand: IBrand = await this.brandsDao.getByName(name);
    if (foundBrand) throw new ErrorResponse(400, reqT('same_name_exists'));

    // generate unique slug
    const slug = generateSlug(name, { replacement: "", lower: false })

    const admin = await this.authService.createVerifiedUser({
      email: `admin@${slug.toLowerCase()}.com`,
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

    if (styles && styles.length > 0) {
      if (!Array.isArray(styles)) styles = [styles]
      for await (const style_id of styles) {
        await this.brandsDao.createBrandStyle({ brand_id: brand.id, style_id: Number(style_id) })
      }
    }

    return {
      brand: imageUpdate,
      admin: admin
    }
  }

  async update(brand_id: string, values: IUpdateBrand & IBrandAuth, brand_image?: IRequestFile): Promise<IBrand> {
    const foundBrand: IBrand = await this.brandsDao.getById(brand_id);
    if (isEmpty(foundBrand)) throw new ErrorResponse(400, reqT('brand_404'));

    const { styles, username, password, ...otherValues } = values;

    if (username || password) {
      let brandAdmin = await this.brandsDao.getBrandAdmin({ brand_id });

      if (brandAdmin) {
        if (username) {
          await this.usersService.update(brandAdmin?.id, { username })
        }
        if (password) {
          const { data, error } = await supabase.auth.admin.updateUserById(brandAdmin?.profile_id, { password })
          if (error) throw new ErrorResponse(400, error.message);
        }
      }
    }

    let brand: IBrand = Object.keys(otherValues).length ? await this.brandsDao.update(brand_id, otherValues) : foundBrand

    if (brand_image) {
      brand = await this.updateImage(brand_id, brand_image);
    }

    if (styles && styles.length > 0) {
      await this.brandsDao.deleteBrandStyles(brand_id)
      for await (const style_id of styles) {
        await this.brandsDao.createBrandStyle({ brand_id, style_id: Number(style_id) })
      }
    }

    return brand
  }

  async updateImage(brand_id: string, image: IRequestFile): Promise<IBrand> {
    const brand: IBrand = await this.brandsDao.getById(brand_id);
    if (isEmpty(brand)) throw new ErrorResponse(400, reqT('brand_404'));

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

    const data = brands.map(e => {
      return {
        ...e,
        styles: !e.styles[0] ? [] : e.styles,
      }
    })

    return data
  }

  async count(filters): Promise<number> {
    return await this.brandsDao.count(filters);
  }

  async findOne(identifier: string): Promise<IBrand> {
    const brand = await this.brandsDao.getBySlugOrId(identifier);
    if (!brand) throw new ErrorResponse(404, reqT('brand_404'));

    if (brand.styles && !brand.styles[0]) {
      brand.styles = []
    }

    return brand
  }

  async delete(brand_id: string): Promise<void> {
    const brand = await this.brandsDao.getById(brand_id);
    if (!brand) throw new ErrorResponse(404, reqT('brand_404'))

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