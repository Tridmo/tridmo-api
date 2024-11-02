import { IDefaultQuery } from './../../modules/shared/interface/query.interface';
import InteriorsDAO from "./interiors.dao";
import { IAddImageResult, ICreateInterior, ICreateInteriorBody, ICreateInteriorLike, IFilterInteriorLike, IGetInteriorsQuery, IInterior, IInteriorLike, IUpdateInterior } from "./interiors.interface";
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
import { IUser } from '../users/users.interface';
import SavedInteriorsService from '../saved_interiors/saved_interiors.service';
import { reqT } from '../shared/utils/language';
import { authVariables } from '../auth/variables';
import NotificationsService from '../notifications/notifications.service';
import path from 'path';
import fs from 'fs';
import { getFile } from '../shared/utils/s3';
import compressFile from '../shared/utils/compressFile';

export default class InteriorService {
  private interiorsDao = new InteriorsDAO()
  private interiorImageService = new InteriorImageService()
  private imageService = new ImageService()
  private usersService = new UsersService()
  private interactionService = new InteractionService()
  private savedInteriorsService = new SavedInteriorsService()
  private notificationsService = new NotificationsService()

  async compressInteriorsImages(alreadyDoneIds?: string[], limit?: number) {
    const interiors = await this.interiorsDao.getAll({ exclude_interiors: alreadyDoneIds }, { limit: limit || 10, orderBy: 'created_at' });

    const done = []
    const largeImages = []

    for (const interior of interiors) {
      console.log('-------------------START--------------------');
      console.log(`${interior.id} | ${interior.slug}`)

      const images = await this.interiorImageService.findByModelWithImage(interior.id)
      for (const image of images) {
        // if ((typeof image.size == 'string' ? Number(image.size) : image.size) > 100000) {}
        const fileName = image.key.split('/').pop().split('.')[0]
        const fetchedFile = await getFile(s3Vars.imagesBucket, image.key)
        const compressedFile = await compressFile(fetchedFile)

        const uploadedImage = await uploadFile({
          files: compressedFile,
          fileName: fileName,
          extension: 'webp',
          folder: `images/interiors/${interior.slug}`,
          bucketName: s3Vars.imagesBucket,
        })

        const updated = await this.imageService.update(image.id, {
          name: `${image.name.split('.')[0]}.${uploadedImage[0].ext}`,
          size: uploadedImage[0].size,
          src: uploadedImage[0].src,
          key: uploadedImage[0].key,
          ext: uploadedImage[0].ext,
          mimetype: uploadedImage[0].mimetype,
        })

        await deleteFile(s3Vars.imagesBucket, image.key)

        var imageActionInfo = `${image.key}: ${image.size} -> ${uploadedImage[0].size}`;
        console.log(imageActionInfo);
      }
      done.push(interior.id)
      addIdsToJsonArray(interior.id)
      console.log('--------------------END---------------------');

      const action = `
      -------------------START--------------------
      ${interior.id} | ${interior.slug}
      ${imageActionInfo}
      --------------------END---------------------
      `
      writeActionToFile(action)
    }

    return {
      largeImages,
      done
    }
  }

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
    const uploadedCover = await uploadFile({
      files: cover,
      folder: `images/interiors/${interior.slug}`,
      bucketName: s3Vars.imagesBucket,
      fileName: 'cover',
      dimensions: fileDefaults.interior_cover
    })
    const cover_image = await this.imageService.create({ ...uploadedCover[0] })
    await this.interiorImageService.create({
      interior_id: interior.id,
      image_id: cover_image.id,
      is_main: true,
      index: 0,
    })

    const uploadedImages = await uploadFile({
      files: images,
      folder: `images/interiors/${interior.slug}`,
      bucketName: s3Vars.imagesBucket,
      compress: 30
    })
    await Promise.all(uploadedImages.map(async (i, index) => {
      const image = await this.imageService.create(i)
      await this.interiorImageService.create({
        interior_id: interior.id,
        image_id: image.id,
        is_main: false,
        index: index + 1,
      })
    }))

    return interior
  }

  async update(
    id: string,
    values: IUpdateInterior,
    user: IUser,
    cover?: IRequestFile,
    images?: IRequestFile[],
  ): Promise<IInterior> {
    const interior = await this.interiorsDao.getByIdMinimal(id)
    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));

    if (user.role_id != authVariables.roles.admin && interior.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));

    const { removed_images, ...otherValues } = values

    const updated = await this.interiorsDao.update(id, otherValues)

    if (cover) {
      const modelCover = await this.interiorImageService.findInteriorCover(id)
      await this.deleteImage(modelCover.image_id)
      // upload and create cover image
      const uploadedCover = await uploadFile({
        files: cover,
        folder: `images/interiors/${interior.slug}`,
        bucketName: s3Vars.imagesBucket,
        fileName: 'cover',
        dimensions: fileDefaults.interior_cover
      })

      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      const i = await this.interiorImageService.create({
        interior_id: interior.id,
        image_id: cover_image.id,
        is_main: true,
        index: 0,
      })
    }
    if (removed_images && removed_images?.length) {
      for await (const i of removed_images) {
        await this.deleteImage(i)
      }
    }
    if (images) {
      const otherImages = await this.interiorImageService.findByInterior(id)
      const maxIndex = Math.max(...otherImages.map(item => item.index));
      const startIndex = maxIndex ? maxIndex + 1 : 1;
      // upload and create other images
      const uploadedImages = await uploadFile({
        files: images,
        folder: `images/interiors/${interior.slug}`,
        bucketName: s3Vars.imagesBucket,
        compress: 30
      })
      await Promise.all(uploadedImages.map(async (i, index) => {
        const image = await this.imageService.create(i)
        await this.interiorImageService.create({
          interior_id: interior.id,
          image_id: image.id,
          is_main: false,
          index: startIndex + index,
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

  async addLike({ interior_id, user_id }: ICreateInteriorLike): Promise<boolean> {
    const interior = await this.findById(interior_id)
    const existing = (await this.interiorsDao.findLike({ interior_id, user_id })).length > 0;
    if (existing) return false;
    const notification = await this.notificationsService.create({
      interior_id,
      action_id: 'new_interior_like',
      notifier_id: user_id,
      recipient_id: interior.user_id,
    })
    await this.interiorsDao.createLike(interior.interaction_id, { interior_id, user_id, notification_id: notification?.id });
    return true;
  }
  async removeLike({ interior_id, user_id }: IFilterInteriorLike): Promise<void> {
    const like = await this.interiorsDao.findLike({ interior_id, user_id })
    if (!like) return;
    if (like?.[0]?.notification_id) await new NotificationsService().deleteById(like?.[0]?.notification_id);
    const interior = await this.findById(interior_id)
    await this.interiorsDao.removeLike(interior.interaction_id, { interior_id, user_id });
  }

  async findOne(identifier: string, currentUser?: IUser): Promise<IInterior> {

    const interior = await this.interiorsDao.getByIdOrSlug(identifier);

    if (isEmpty(interior)) throw new ErrorResponse(404, reqT('interior_404'));

    interior.is_saved = false;

    if (currentUser) {
      const saved = await this.savedInteriorsService.findAllMin({
        user_id: currentUser.id,
        interior_id: interior.id
      }, {})
      const liked = await this.interiorsDao.findLike({
        user_id: currentUser.id,
        interior_id: interior.id
      })

      interior.is_saved = saved.length > 0;
      interior.is_liked = liked.length > 0;
    }

    if (interior.used_models?.length && !interior.used_models[0]) {
      interior.used_models = [];
    }
    if (interior.images?.length && !interior.images?.[0]) {

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
      const uploadedCover = await uploadFile({
        files: cover,
        folder: `images/interiors/${interior.slug}`,
        bucketName: s3Vars.imagesBucket,
        fileName: 'cover',
        dimensions: fileDefaults.interior_cover
      })
      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      await this.interiorImageService.create({
        interior_id,
        image_id: cover_image.id,
        is_main: true,
        index: 0,
      })

      result.cover = cover_image
    }

    if (images) {
      const uploadedImages = await uploadFile({
        files: images,
        folder: `images/interiors/${interior.slug}`,
        bucketName: s3Vars.imagesBucket,
      })
      if (uploadedImages.length > 1) {
        await Promise.all(uploadedImages.map(async (i, index) => {
          const image = await this.imageService.create(i)
          await this.interiorImageService.create({
            interior_id,
            image_id: image.id,
            is_main: false,
            index: index + 1,
          })
          result.images.push(image)
        }))
      } else {
        const image = await this.imageService.create(uploadedImages[0])
        await this.interiorImageService.create({
          interior_id,
          image_id: image.id,
          is_main: false,
          index: 1
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

    const deleted = await this.imageService.delete(image_id)

    return deleted
  }

  async deleteById(id: string, user: IUser): Promise<number> {
    const interior = await this.interiorsDao.getByIdMinimal(id)
    if (!interior) throw new ErrorResponse(404, reqT('interior_404'));

    if (user?.role_id != authVariables.roles.admin && interior.user_id != user.id) throw new ErrorResponse(403, reqT('access_denied'));

    const interiorImages = await this.interiorImageService.findByInterior(id)

    await Promise.all(
      interiorImages.map(async interior_image => {
        await this.imageService.delete(interior_image.image_id)
      })
    )

    const deleted = await this.interiorsDao.deleteById(id)

    await this.interactionService.delete(interior.interaction_id)

    return deleted
  }
}

const addIdsToJsonArray = (arr: string[] | string) => {
  const filePath = path.join(__dirname, 'data.json');
  // Step 1: Read the file
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    try {
      // Step 2: Parse JSON
      const jsonData = JSON.parse(data);

      // Step 3: Push new id into the array (assuming the array is named 'ids')
      jsonData.ids = jsonData.ids || []; // Ensure array exists

      if (typeof arr == 'string') {
        if (!jsonData.ids.includes(arr)) jsonData.ids.push(arr);
      }
      else if (Array.isArray(arr)) {
        arr.map(el => {
          if (!jsonData.ids.includes(el)) {
            jsonData.ids.push(el);
          }
        })
      }

      // Step 4: Write the updated JSON back to the file
      fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {
        if (err) {
          console.error("Error writing to the file:", err);
        } else {
          console.log("ID added successfully.");
        }
      });
      return jsonData
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
    }
  });
};

const writeActionToFile = (action: string) => {
  const filePath = path.join(__dirname, 'action.txt');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    try {
      fs.writeFile(filePath, `${data} \n ${action}`, 'utf-8', (err) => {
        if (err) {
          console.error("Error writing to the file:", err);
        } else {
          console.log("Action written successfully.");
        }
      });
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
    }
  })
};