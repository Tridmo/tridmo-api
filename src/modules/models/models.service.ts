import { deleteFile, uploadFile } from '../shared/utils/fileUpload';
import ErrorResponse from '../shared/utils/errorResponse';
import { defaults, fileDefaults } from '../shared/defaults/defaults';
import { IDefaultQuery } from './../shared/interface/query.interface';
import ModelsDAO from "./models.dao";
import { IAddImageResult, ICreateModel, ICreateModelBody, IGetModelsQuery, IModel, IUpdateModel } from "./models.interface";
import generateSlug, { indexSlug } from '../shared/utils/generateSlug';
import FileService from '../shared/modules/files/files.service';
import { isEmpty } from 'lodash';
import { s3Vars } from '../../config/conf';
import { IFile, IFilePublic, IImage, IRequestFile } from '../shared/interface/files.interface';
import ModelMaterialService from './model_materials/model_materials.service';
import ModelColorService from './model_colors/model_colors.service';
import ImageService from '../shared/modules/images/images.service';
import ModelImageService from './model_images/model_images.service';
import flat from 'flat'
import { IModelColor } from './model_colors/interface/model_colors.interface';
import { checkObject, generatePresignedUrl, getFile } from '../shared/utils/s3';
import { IModelMaterial } from './model_materials/interface/model_materials.interface';
import DownloadsService from '../downloads/downloads.service';
import InteractionService from '../interactions/interactions.service';
import BrandsDAO from '../brands/brands.dao';
import SavedModelsService from '../saved_models/saved_models.service';
import { IUser } from '../users/users.interface';
import { reqT } from '../shared/utils/language';
import NotificationsService from '../notifications/notifications.service';
import { IReqUser } from '../shared/interface/routes.interface';
import { authVariables } from '../auth/variables';
import fs from 'fs'
import path from 'path';
import sharp from 'sharp';
import compressFile from '../shared/utils/compressFile';

export default class ModelService {
  private modelsDao = new ModelsDAO()
  private fileService = new FileService()
  private modelMaterialService = new ModelMaterialService()
  private modelColorService = new ModelColorService()
  private modelImageService = new ModelImageService()
  private imageService = new ImageService()
  private downloadService = new DownloadsService()
  private interactionService = new InteractionService()
  private savedModelsService = new SavedModelsService()
  private notificationsService = new NotificationsService()
  private brandsDao = new BrandsDAO()

  async compressModelsImages(alreadyDoneIds?: string[], limit?: number) {
    const models = await this.modelsDao.getAll({ exclude_models: alreadyDoneIds }, { limit: limit || 10, orderBy: 'created_at' });

    const done = []
    const largeImages = []

    for (const model of models) {
      const images = await this.modelImageService.findByModelWithImage(model.id)
      for (const image of images) {
        // if ((typeof image.size == 'string' ? Number(image.size) : image.size) > 100000) {}
        const fileName = image.key.split('/').pop().split('.')[0]
        const fetchedFile = await getFile(s3Vars.imagesBucket, image.key)
        const compressedFile = await compressFile(fetchedFile)

        const uploadedImage = await uploadFile({
          files: compressedFile,
          fileName: fileName,
          extension: 'webp',
          folder: `images/models/${model.slug}`,
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

        console.log('______________________________________');
        console.log(image);
        console.log(uploadedImage);
        console.log(updated);
        console.log('______________________________________');
      }
      done.push(model.id)
    }

    addIdsToJsonArray(done)
    return {
      largeImages,
      done
    }
  }

  async create(
    data: ICreateModelBody,
    cover: IRequestFile,
    images: IRequestFile[],
    file: IRequestFile
  ): Promise<IModel> {
    // const yamoIdExist = await this.findByFilters({yamo_id});
    // if (yamoIdExist) throw new ErrorResponse(400, 'Bu Yamo Id allaqachon mavjud!')

    const { materials, colors, ...modelValues } = data

    const brand = await this.brandsDao.getById(modelValues.brand_id)

    if (!brand) throw new ErrorResponse(404, 'Brand was not found')

    // generate unique slug
    modelValues['slug'] = generateSlug(modelValues.name)
    const foundSlugs = await this.modelsDao.getSimilarSlugs(modelValues['slug'])
    if (foundSlugs && !isEmpty(foundSlugs)) modelValues['slug'] = indexSlug(modelValues['slug'], foundSlugs.map(model => model.slug))

    // upload and create file
    const uploadedFile = await uploadFile({
      files: file,
      folder: `files/models`,
      fileName: modelValues['slug'],
      bucketName: s3Vars.filesBucket
    })
    const newFile = await this.fileService.create({ ...uploadedFile[0] })

    const interactions = await this.interactionService.create();

    // create model
    const model = await this.modelsDao.create({
      ...modelValues,
      interaction_id: interactions.id,
      file_id: newFile.id
    })

    // create materials
    if (materials && materials.length > 0) {
      for await (const material_id of materials) {
        await this.modelMaterialService.create({ model_id: model.id, material_id: Number(material_id) })
      }
    }
    // create colors
    if (colors && colors.length > 0) {
      for await (const color_id of colors) {
        await this.modelColorService.create({ model_id: model.id, color_id: Number(color_id) })
      }
    }

    // upload and create cover image
    const uploadedCover = await uploadFile({
      files: cover,
      folder: `images/models/${model?.slug}`,
      bucketName: s3Vars.imagesBucket,
      fileName: 'cover',
      dimensions: fileDefaults.model_cover
    })
    const cover_image = await this.imageService.create({ ...uploadedCover[0] })
    await this.modelImageService.create({
      model_id: model.id,
      image_id: cover_image.id,
      is_main: true,
      index: 0
    })

    // upload and create other images
    const uploadedImages = await uploadFile({
      files: images,
      folder: `images/models/${modelValues['slug']}`,
      bucketName: s3Vars.imagesBucket,
      dimensions: fileDefaults.model,
    })
    await Promise.all(uploadedImages.map(async (i, index) => {
      const image = await this.imageService.create(i)
      await this.modelImageService.create({
        model_id: model.id,
        image_id: image.id,
        is_main: false,
        index: index + 1,
      })
    }))

    return model
  }

  async update(
    id: string,
    values: IUpdateModel,
    cover?: IRequestFile,
    images?: IRequestFile[],
    file?: IRequestFile
  ): Promise<IModel> {

    const foundModel: IModel = await this.modelsDao.getByIdMinimal(id);
    if (isEmpty(foundModel)) throw new ErrorResponse(404, reqT('model_404'));

    const { colors, materials, removed_images, ...otherValues } = values;

    const model: IModel = Object.keys(otherValues).length ? await this.modelsDao.update(id, otherValues) : foundModel

    if (materials && materials.length > 0) {
      await this.modelMaterialService.deleteByModel(id)
      for await (const material_id of materials) {
        await this.modelMaterialService.create({ model_id: id, material_id: Number(material_id) })
      }
    }
    if (colors && colors.length > 0) {
      await this.modelColorService.deleteByModel(id)
      for await (const color_id of colors) {
        await this.modelColorService.create({ model_id: id, color_id: Number(color_id) })
      }
    }
    if (file) {
      const uploadedFile = await uploadFile({
        files: file,
        folder: `files/models`,
        fileName: model.slug,
        bucketName: s3Vars.filesBucket
      })
      const newFile = await this.fileService.create({ ...uploadedFile[0] })
      await this.modelsDao.update(id, { file_id: newFile?.id })
      const oldFile = await this.fileService.findOne(model?.file_id)
      await deleteFile(s3Vars.imagesBucket, oldFile?.src)
      await this.fileService.delete(model.file_id)
    }
    if (cover) {
      const modelCover = await this.modelImageService.findModelCover(id)
      await this.deleteImage(modelCover.image_id)
      // upload and create cover image
      const uploadedCover = await uploadFile({
        files: cover,
        folder: `images/models/${model.slug}`,
        bucketName: s3Vars.imagesBucket,
        fileName: 'cover',
        dimensions: fileDefaults.model_cover
      })
      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      await this.modelImageService.create({
        model_id: model.id,
        image_id: cover_image.id,
        is_main: true,
        index: 0
      })
    }
    if (removed_images && removed_images?.length) {
      for await (const i of removed_images) {
        await this.deleteImage(i)
      }
    }
    if (images) {
      const otherImages = await this.modelImageService.findByModel(id)
      const maxIndex = Math.max(...otherImages.map(item => item.index));
      const startIndex = maxIndex ? maxIndex + 1 : 1;
      // upload and create other images
      const uploadedImages = await uploadFile({
        files: images,
        folder: `images/models/${model.slug}`,
        bucketName: s3Vars.imagesBucket,
        dimensions: fileDefaults.model,
      })
      await Promise.all(uploadedImages.map(async (i, index) => {
        const image = await this.imageService.create(i)
        await this.modelImageService.create({
          model_id: model.id,
          image_id: image.id,
          is_main: false,
          index: startIndex + index,
        })
      }))
    }

    // remove top tag if not available
    if (otherValues.availability == 2 && foundModel?.top == true) {
      return await this.modelsDao.update(id, {
        availability: otherValues.availability,
        top: false
      })
    }

    return model
  }

  async updateByBrand(brand_id: string, values): Promise<IModel> {
    return await this.modelsDao.updateByBrand(brand_id, values)
  }

  async findAll(
    filters: IGetModelsQuery,
    sorts: IDefaultQuery
  ): Promise<IModel[]> {

    const models = await this.modelsDao.getAll(filters, sorts);

    models.forEach((m, i) =>
      models[i] = flat.unflatten(m)
    )

    return models
  }

  async count(filters: IGetModelsQuery): Promise<number> {
    return await this.modelsDao.count(filters);
  }

  async findOne(identifier: string, currentUser?: IUser): Promise<IModel> {
    const model = await this.modelsDao.getByIdOrSlug(identifier);

    if (!model) throw new ErrorResponse(404, reqT('model_404'));

    model.is_saved = false;

    if (currentUser) {
      const saved = await this.savedModelsService.findAllMin({
        user_id: currentUser.id,
        model_id: model.id
      }, {})

      model.is_saved = saved.length > 0;
    }

    if (model.used_interiors?.length && !model.used_interiors[0]) {
      model.used_interiors = [];
    }
    if (model.images?.length && !model.images[0]) {
      model.images = [];
    }
    // else {
    // model['cover'] = model.images.find(i => i?.is_main == true)
    // model['images'] = model.images.filter(i => i?.is_main == false)
    // }

    const file = await this.fileService.findOne(model.file_id)

    const filePublicData: IFilePublic = {
      name: file.name,
      size: file.size,
      ext: file.ext,
      mimetype: file.mimetype,
    }

    model.file = filePublicData

    // model.images.sort((a, b) => {
    //   if (a['is_main'] && !b['is_main']) {
    //     return -1; // a comes before b
    //   } else if (!a['is_main'] && b['is_main']) {
    //     return 1; // b comes before a
    //   } else {
    //     return 0; // order remains unchanged
    //   }
    // });

    return flat.unflatten(model)
  }

  async findById(id: string): Promise<IModel> {
    const data = await this.modelsDao.getByIdMinimal(id);

    if (!data) throw new ErrorResponse(404, reqT('model_404'));

    return data
  }

  async findByBrand(brand_id): Promise<IModel> {
    const model = await this.modelsDao.getByBrandId(brand_id);
    return model
  }

  async findByFilters(filters: IGetModelsQuery): Promise<IModel[]> {
    if (Object.keys(filters).length == 0) throw new ErrorResponse(400, "Filters required!")

    const model = await this.modelsDao.getByFilters(filters.name, filters);

    return model
  }

  async deleteImage(image_id: string): Promise<number> {
    const image = await this.imageService.findOne(image_id);
    if (isEmpty(image)) throw new ErrorResponse(404, "Image was not found");

    await deleteFile(s3Vars.imagesBucket, image.src)

    await this.modelImageService.deleteByImage(image_id)
    const deleted = await this.imageService.delete(image_id)

    return deleted
  }

  async addColors(model_id: string, colors: number[]): Promise<IModelColor[]> {

    const model: IModel = await this.modelsDao.getByIdMinimal(model_id);
    if (!model) throw new ErrorResponse(404, reqT('model_404'));

    const addedColors = []

    if (colors.length > 1) {
      Promise.all(colors.map(async color_id => {
        // const found_model_color = await this.modelColorService.findByModelAndColor(model_id, color_id)
        // if (!found_model_color) await this.modelColorService.create({ model_id: model_id, color_id })
        const newColor = await this.modelColorService.create({ model_id: model_id, color_id })
        if (newColor) addedColors.push(newColor)
      }))
    } else {
      // const found_model_color = await this.modelColorService.findByModelAndColor(model_id, color_id: colors[0])
      // if (!found_model_color) await this.modelColorService.create({ model_id: model_id, color_id: colors[0] })
      const newColor = await this.modelColorService.create({ model_id: model_id, color_id: colors[0] })
      if (newColor) addedColors.push(newColor)
    }

    return addedColors
  }

  async addImages(model_id: string, cover: IRequestFile, images: IRequestFile[]): Promise<IAddImageResult> {
    const model = await this.modelsDao.getByIdOrSlug_min(model_id)
    const result: IAddImageResult = {};

    if (cover) {
      const uploadedCover = await uploadFile({
        files: cover,
        folder: `images/models/${model.slug}`,
        bucketName: s3Vars.imagesBucket,
        fileName: 'cover',
        dimensions: fileDefaults.model_cover
      })
      const cover_image = await this.imageService.create({ ...uploadedCover[0] })
      await this.modelImageService.create({
        model_id,
        image_id: cover_image.id,
        is_main: true,
        index: 0
      })

      result.cover = cover_image
    }

    if (images) {
      const otherImages = await this.modelImageService.findByModel(model_id)
      const maxIndex = Math.max(...otherImages.map(item => item.index));
      const startIndex = maxIndex ? maxIndex + 1 : 1;
      const uploadedImages = await uploadFile({
        files: images,
        folder: `images/models/${model.slug}`,
        bucketName: s3Vars.imagesBucket,
        dimensions: fileDefaults.model,
      })
      if (uploadedImages.length > 1) {
        await Promise.all(uploadedImages.map(async (i, index) => {
          const image = await this.imageService.create(i)
          await this.modelImageService.create({
            model_id: model.id,
            image_id: image.id,
            is_main: false,
            index: startIndex + index,
          })
        }))
      } else {
        const image = await this.imageService.create(uploadedImages[0])
        await this.modelImageService.create({
          model_id: model.id,
          image_id: image.id,
          is_main: false,
          index: startIndex,
        })
        result.images.push(image)
      }
    }

    return result
  }

  async updateFile(model_id: string, file: IRequestFile): Promise<IFile> {
    // find model and check existance
    const foundModel: IModel = await this.modelsDao.getByIdMinimal(model_id);
    if (!foundModel) throw new ErrorResponse(404, "Model was not found");
    // find current file of model
    const oldFile = await this.fileService.findOne(foundModel.file_id);

    // check if it exists in storage and delete if yes
    const fileExists = await checkObject(s3Vars.filesBucket, oldFile.key)
    if (fileExists) await deleteFile(s3Vars.filesBucket, oldFile.key)

    // upload new file and create add to db
    const uploadedFile = await uploadFile({
      files: file,
      folder: `files/models`,
      fileName: foundModel.slug,
      bucketName: s3Vars.filesBucket
    })
    const newFile = await this.fileService.update(foundModel.file_id, { ...uploadedFile[0] })

    // connect model to new file
    await this.modelsDao.update(model_id, { file_id: newFile.id })

    return newFile
  }

  async addMaterials(model_id: string, materials: number[]): Promise<IModelMaterial[]> {
    const model: IModel = await this.modelsDao.getByIdMinimal(model_id);
    if (!model) throw new ErrorResponse(400, "Model was not found");

    const addedMaterials = []

    if (materials.length > 1) {
      Promise.all(materials.map(async material_id => {
        // const found_model_material = await this.modelMaterialService.findByModelAndMaterial(model_id, material_id)
        // if (!found_model_material) await this.modelMaterialService.create({ model_id: model_id, material_id })
        const newMaterial = await this.modelMaterialService.create({ model_id: model_id, material_id })
        if (newMaterial) addedMaterials.push(newMaterial)
      }))
    } else {
      // const found_model_material = await this.modelMaterialService.findByModelAndMaterial(model_id, material_id: materials[0])
      // if (!found_model_material) await this.modelMaterialService.create({ model_id: model_id, material_id: materials[0] })
      const newMaterial = await this.modelMaterialService.create({ model_id: model_id, material_id: materials[0] })
      if (newMaterial) addedMaterials.push(newMaterial)
    }

    return addedMaterials
  }

  async removeMaterial(model_id: string, material_id: number): Promise<number> {
    const foundModel: IModel = await this.modelsDao.getByIdMinimal(model_id);
    if (!foundModel) throw new ErrorResponse(400, "Model was not found");

    return await this.modelMaterialService.deleteByMaterialAndModel(foundModel.id, material_id)
  }

  async removeColor(model_id: string, color_id: number): Promise<number> {
    const foundModel: IModel = await this.modelsDao.getByIdMinimal(model_id);
    if (!foundModel) throw new ErrorResponse(400, "Model was not found");

    return await this.modelColorService.deleteByColorAndModel(foundModel.id, color_id)
  }

  async deleteById(model_id: string): Promise<number> {
    const model = await this.modelsDao.getByIdMinimal(model_id)

    if (!model) throw new ErrorResponse(404, "Model was not found");


    const modelImages = await this.modelImageService.findByModel(model_id)

    await Promise.all(
      modelImages.map(async model_image => {
        await this.imageService.delete(model_image.image_id)
      })
    )
    const deleted = await this.modelsDao.deleteById(model_id)

    await this.interactionService.delete(model.interaction_id)

    const file = await this.fileService.findOne(model.file_id)
    await deleteFile(s3Vars.filesBucket, file.src)
    await this.fileService.delete(file.id)

    return deleted
  }

  async download(model_id: string, user: IReqUser): Promise<string> {
    const model = await this.modelsDao.getByIdMinimal(model_id)
    if (!model) throw new ErrorResponse(404, reqT('model_404'));

    const file = await this.fileService.findOne(model.file_id)
    if (!file) throw new ErrorResponse(404, reqT('file_404'));

    const presignedUrl = await generatePresignedUrl(file.src)

    const isAdmin = user.roles.find(e => e.role_id == authVariables.roles.admin || e.role_id == authVariables.roles.brand)

    const downloads = await this.downloadService.findBy({ model_id: model.id, user_id: user.profile.id });
    if (!downloads.length && !isAdmin) {
      await this.downloadService.create({ model_id: model.id, user_id: user.profile.id })
      const brandAdmin = await this.brandsDao.getBrandAdmin({ brand_id: model.brand_id })
      if (brandAdmin) {
        await this.notificationsService.create({
          model_id: model_id,
          action_id: 'new_model_download',
          notifier_id: user.profile.id,
          recipient_id: brandAdmin.profile_id,
        })
      }
    }

    return presignedUrl
  }

  async deleteByBrandId(brand_id: string): Promise<number> {
    return await this.modelsDao.deleteByBrandId(brand_id);
  }
}

const addIdsToJsonArray = (arr: string[]) => {
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

      arr.map(el => {
        if (!jsonData.ids.includes(el)) {
          jsonData.ids.push(el);
        }
      })

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