import { IDefaultQuery } from './../../modules/shared/interface/query.interface';
import InteriorsDAO from "./dao/interiors.dao";
import { IAddImageResult, ICreateInterior, ICreateInteriorBody, IGetInteriorsQuery, IInterior, IUpdateInterior } from "./interface/interiors.interface";
import { IRequestFile } from '../shared/interface/files.interface';
import generateSlug, { indexSlug } from '../shared/utils/generateSlug';
import { isEmpty } from 'lodash';
import InteriorImageService from './interior_images/interior_images.service';
import { fileDefaults } from '../shared/defaults/defaults';
import { s3Vars } from '../../config/conf';
import ImageService from '../shared/modules/images/images.service';
import { deleteFile, uploadFile } from '../shared/utils/fileUpload';
import InteriorModelsService from './interior_models/interior_models.service';
import { isUUID } from 'class-validator';
import ModelService from '../models/models.service';
import ImageTagsService from '../interior_models/interior_models.service';
import ErrorResponse from '../shared/utils/errorResponse';
import flat from 'flat';
import UsersService from '../users/users.service';
import InteractionService from '../interactions/interactions.service';
import { IUser } from '../users/interface/users.interface';
import SavedInteriorsService from '../saved_interiors/saved_interiors.service';
import { reqT } from '../shared/utils/language';

export default class InteriorService {
  // private modelService = new ModelService()
  // private imageTagService = new ImageTagsService()
  // private interiorModelService = new InteriorModelsService()
  private interiorsDao = new InteriorsDAO()
  private interiorImageService = new InteriorImageService()
  private imageService = new ImageService()
  private usersService = new UsersService()
  private interactionService = new InteractionService()
  private savedInteriorsService = new SavedInteriorsService()

  async create(
    data: ICreateInteriorBody,
    cover: IRequestFile,
    images: IRequestFile[],
    author: IUser
  ): Promise<IInterior> {

    const { tags, ...interiorValues } = data

    // generate unique slug
    let slug = generateSlug(data.name)
    const foundSlugs = await this.interiorsDao.getSimilarSlugs(slug)
    if (foundSlugs && !isEmpty(foundSlugs)) slug = indexSlug(slug, foundSlugs.map(model => model.slug))

    const interaction = await this.interactionService.create()

    const interior = await this.interiorsDao.create({
      ...interiorValues,
      interaction_id: interaction.id,
      user_id: author.id,
      slug,
    })

    // upload and create cover image
    const uploadedCover = await uploadFile(cover, "images/interiors", s3Vars.imagesBucket, /*fileDefaults.model_cover*/)
    const cover_image = await this.imageService.create({ ...uploadedCover[0] })
    await this.interiorImageService.create({
      interior_id: interior.id,
      image_id: cover_image.id,
      is_main: true
    })

    // upload and create other images
    const uploadedImages = await uploadFile(images, "images/interiors", s3Vars.imagesBucket, /*fileDefaults.interior*/)
    Promise.all(uploadedImages.map(async i => {
      const image = await this.imageService.create(i)
      await this.interiorImageService.create({
        interior_id: interior.id,
        image_id: image.id,
        is_main: false
      })
    }))

    return interior
  }

  async update(
    id: string,
    values: IUpdateInterior,
    cover?: IRequestFile,
    images?: IRequestFile[],
  ): Promise<IInterior> {
    const interior = await this.interiorsDao.getByIdMinimal(id)
    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));

    const { removed_images, ...otherValues } = values

    const updated = await this.interiorsDao.update(id, otherValues)

    if (cover) {
      const modelCover = await this.interiorImageService.findInteriorCover(id)
      await this.deleteImage(modelCover.image_id)
      // upload and create cover image
      const uploadedCover = await uploadFile(cover, "images/products", s3Vars.imagesBucket, /*fileDefaults.model_cover*/)
      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      await this.interiorImageService.create({
        interior_id: interior.id,
        image_id: cover_image.id,
        is_main: true
      })
    }
    if (removed_images && removed_images?.length) {
      for await (const i of removed_images) {
        await this.deleteImage(i)
      }
    }
    if (images) {
      // upload and create other images
      const uploadedImages = await uploadFile(images, "images/products", s3Vars.imagesBucket, /*fileDefaults.interior*/)
      Promise.all(uploadedImages.map(async (i, ind) => {
        const image = await this.imageService.create(i)
        await this.interiorImageService.create({
          interior_id: interior.id,
          image_id: image.id,
          is_main: false
        })
      }))
    }

    return updated
  }

  async findAll(
    filters: IGetInteriorsQuery,
    sorts: IDefaultQuery
  ): Promise<IInterior[]> {

    const interiors = await this.interiorsDao.getAll(filters, sorts);

    interiors.forEach((e, i) => {
      interiors[i] = flat.unflatten(e)
    })

    return interiors
  }

  async count(filters: IGetInteriorsQuery): Promise<number> {
    return await this.interiorsDao.count(filters);
  }

  async findOne(identifier: string, currentUser?: IUser): Promise<IInterior> {

    const interior = await this.interiorsDao.getByIdOrSlug(identifier);

    if (isEmpty(interior)) throw new ErrorResponse(404, reqT('interior_404'));

    interior.is_saved = false;

    if (currentUser) {
      const saved = await this.savedInteriorsService.findAll({
        user_id: currentUser.id,
        interior_id: interior.id
      })

      interior.is_saved = saved.length > 0;
    }

    if (interior.used_models?.length && !interior.used_models[0]) {
      interior.used_models = [];
    }
    if (interior.images?.length && !interior.images[0]) {
      interior.images = [];
    }

    return flat.unflatten(interior)
  }

  async findById(id: string): Promise<IInterior> {

    const interior = await this.interiorsDao.getByIdMinimal(id);

    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));

    return interior
  }

  async findByAuthorUsername(username: string, sorts: IDefaultQuery): Promise<IInterior[]> {

    const user = await this.usersService.getByUsername(username)

    if (!user) throw new ErrorResponse(404, reqT('user_404'))

    const interiors = await this.interiorsDao.getByAuthor(user.id);

    return interiors
  }

  async addImages(interior_id: string, cover: IRequestFile, images: IRequestFile[]): Promise<IAddImageResult> {

    const interior = await this.interiorsDao.getByIdMinimal(interior_id)
    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));

    const result: IAddImageResult = {};

    if (cover) {
      const uploadedCover = await uploadFile(cover, "images/products", s3Vars.imagesBucket)
      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      await this.interiorImageService.create({
        interior_id,
        image_id: cover_image.id,
        is_main: true
      })

      result.cover = cover_image
    }

    if (images) {
      const uploadedImages = await uploadFile(images, "images/products", s3Vars.imagesBucket)
      if (uploadedImages.length > 1) {
        Promise.all(uploadedImages.map(async i => {
          const image = await this.imageService.create(i)
          await this.interiorImageService.create({
            interior_id,
            image_id: image.id,
            is_main: false
          })
          result.images.push(image)
        }))
      } else {
        const image = await this.imageService.create(uploadedImages[0])
        await this.interiorImageService.create({
          interior_id,
          image_id: image.id,
          is_main: false
        })
        result.images.push(image)
      }
    }

    return result
  }

  async deleteImage(image_id: string): Promise<number> {
    const image = await this.imageService.findOne(image_id);
    if (isEmpty(image)) throw new ErrorResponse(404, reqT('image_404'));

    await deleteFile(s3Vars.imagesBucket, image.src)

    await this.interiorImageService.deleteByImage(image_id)
    const deleted = await this.imageService.delete(image_id)

    return deleted
  }

  async deleteById(id: string): Promise<number> {
    const interior = await this.interiorsDao.getByIdMinimal(id)
    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));


    const interiorImages = await this.interiorImageService.findByInterior(id)

    for await (const interior_image of interiorImages) {
      const image = await this.imageService.findOne(interior_image.image_id)
      await deleteFile(s3Vars.imagesBucket, image.src)
      await this.imageService.delete(interior_image.image_id)
    }

    const deleted = await this.interiorsDao.deleteById(id)

    await this.interactionService.delete(interior.interaction_id)

    return deleted
  }
}