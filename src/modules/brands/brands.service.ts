import { isEmpty } from "class-validator";
import { generateUsername } from "unique-username-generator";
import { s3Vars } from "../../config";
import supabase from "../../database/supabase/supabase";
import AuthService from "../auth/auth.service";
import ModelService from "../models/models.service";
import { fileDefaults } from "../shared/defaults/defaults";
import { IRequestFile } from "../shared/interface/files.interface";
import { IDefaultQuery } from "../shared/interface/query.interface";
import ImageService from "../shared/modules/images/images.service";
import ErrorResponse from "../shared/utils/errorResponse";
import { uploadFile } from "../shared/utils/fileUpload";
import generateSlug from '../shared/utils/generateSlug';
import { reqT } from '../shared/utils/language';
import { IUser } from "../users/users.interface";
import UsersService from "../users/users.service";
import BrandsDAO from "./brands.dao";
import { IBrand, IBrandAuth, ICreateBrand, IGetBrandsQuery, IUpdateBrand } from "./brands.interface";

export default class BrandService {
  private readonly brandsDao = new BrandsDAO()
  private readonly modelsService = new ModelService()
  private readonly imagesService = new ImageService()
  private readonly authService = new AuthService()
  private readonly usersService = new UsersService()

  async create(
    { name, site_link, description, username, password, phone, email, address, styles, instagram, country_id }: ICreateBrand & IBrandAuth,
    brand_image: IRequestFile
  ): Promise<{
    brand: IBrand,
    admin: IUser
  }> {
    const slug = generateSlug(name)

    const foundBrand: IBrand = await this.brandsDao.getBySlug(slug);
    if (foundBrand) throw new ErrorResponse(409, reqT('same_name_exists'));

    username = username || generateUsername('', 0, 32, `${name.toLocaleLowerCase()}admin`)

    const foundUser = await this.usersService.getByUsername(username);
    if (foundUser) throw new ErrorResponse(400, `${reqT('same_name_exists')} (${username})`);

    let brand = await this.brandsDao.create({
      name,
      slug,
      phone,
      email,
      address,
      site_link,
      description,
      instagram,
      country_id
    })

    let image_src = null;
    if (brand) {
      const upload = await uploadFile({
        files: brand_image,
        folder: `images/brands/`,
        fileName: slug,
        bucketName: s3Vars.imagesBucket,
        dimensions: fileDefaults.brand_image,
        compress: fileDefaults.brand_image_compression
      })
      const newImage = await this.imagesService.create(upload[0])
      await this.brandsDao.update(brand.id, {
        image_id: newImage.id
      })
      image_src = newImage.src
    }

    const admin = await this.authService.createVerifiedUser({
      email: email || `${username.toLowerCase()}@${username.toLocaleLowerCase()}.mail`,
      full_name: name,
      username: username,
      company_name: name,
      image_src,
      password
    }, null, brand)

    const brandAdmin = await this.brandsDao.createBrandAdmin({
      brand_id: brand.id,
      profile_id: admin.id
    })

    if (!!admin && !!brandAdmin) {
      await this.authService.syncToChat(admin)
    }

    if (styles && styles.length > 0) {
      if (!Array.isArray(styles)) styles = [styles]
      for (const style_id of styles) {
        await this.brandsDao.createBrandStyle({ brand_id: brand.id, style_id: Number(style_id) })
      }
    }

    return { brand, admin }
  }

  async update(brand_id: string, values: IUpdateBrand & IBrandAuth, brand_image?: IRequestFile): Promise<IBrand> {

    const foundBrand: IBrand = await this.brandsDao.getById(brand_id);
    if (isEmpty(foundBrand)) throw new ErrorResponse(400, reqT('brand_404'));

    const { styles, username, password, ...otherValues } = values;

    if (otherValues.name) {
      const slug = generateSlug(otherValues.name);
      const foundBrand: IBrand = await this.brandsDao.getBySlug(slug);
      if (foundBrand) throw new ErrorResponse(409, reqT('same_name_exists'));
      otherValues.slug = slug
    }

    if (username || password) {
      let brandAdmin = await this.brandsDao.getBrandAdmin({ brand_id });

      if (brandAdmin) {
        if (username) {
          await this.usersService.update(brandAdmin.id, { username })
        }
        if (password) {
          const { data: _, error } = await supabase.auth.admin.updateUserById(brandAdmin?.profiles?.user_id, { password })
          if (error) throw new ErrorResponse(400, error.message);
        }
      }
    }


    let brand: IBrand = Object.keys(otherValues).length ? await this.brandsDao.update(brand_id, otherValues) : foundBrand

    if (brand_image) {
      const brandAdmin = await this.brandsDao.getBrandAdmin({ brand_id });
      brand = await this.updateImage(brand_id, brand_image);
      if (brandAdmin) await this.usersService.update(brandAdmin.id, {}, brand_image);
    }

    if (styles && styles.length > 0) {
      await this.brandsDao.deleteBrandStyles(brand_id)
      for (const style_id of styles) {
        await this.brandsDao.createBrandStyle({ brand_id, style_id: Number(style_id) })
      }
    }

    return brand
  }

  async updateImage(brand_id: string, image: IRequestFile): Promise<IBrand> {
    const brand: IBrand = await this.brandsDao.getById(brand_id);
    if (isEmpty(brand)) throw new ErrorResponse(400, reqT('brand_404'));

    if (brand.image_id) {
      await this.brandsDao.update(brand_id, { image_id: null })
      await this.imagesService.delete(brand.image_id);
    }

    const upload = await uploadFile({
      files: image,
      folder: "images/brands",
      fileName: brand.slug,
      bucketName: s3Vars.imagesBucket,
      dimensions: fileDefaults.brand_image,
      compress: fileDefaults.brand_image_compression
    })
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

  async findAllByUserDownloads(user_id): Promise<IBrand[]> {
    const brands = await this.brandsDao.getAllByUserDownloads(user_id);
    return brands
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

  async findByAdmin(user_id: string): Promise<IBrand> {
    const brand = await this.brandsDao.getByAdmin(user_id);
    return brand
  }

  async delete(brand_id: string): Promise<void> {
    const brand = await this.brandsDao.getById(brand_id);
    if (!brand) throw new ErrorResponse(404, reqT('brand_404'))

    // disconnect models
    await this.modelsService.updateByBrand(brand_id, { brand_id: null })

    // find brand admins and delete them
    const admins = await this.brandsDao.getBrandAdminsByBrand(brand_id)
    Promise.all(
      admins.map(async a => {
        await this.authService.deleteAccount(a['profile_id'])
      })
    )

    // delete brand
    await this.brandsDao.deleteById(brand_id);

    // delete brand image
    await this.imagesService.delete(brand.image_id)
  }
}