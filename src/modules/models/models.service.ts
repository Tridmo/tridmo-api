import { deleteFile, uploadFile } from '../shared/utils/fileUpload';
import ErrorResponse from '../shared/utils/errorResponse';
import { defaults, fileDefaults } from '../shared/defaults/defaults';
import { IDefaultQuery } from './../shared/interface/query.interface';
import ModelsDAO from "./dao/models.dao";
import { IAddImageResult, ICreateModel, IGetModelsQuery, IModel, IUpdateModel } from "./interface/models.interface";
import generateSlug, { indexSlug } from 'modules/shared/utils/generateSlug';
import FileService from 'modules/shared/modules/files/files.service';
import { isEmpty } from 'lodash';
import { s3Vars } from 'config/conf';
import { IFile, IFilePublic, IImage, IRequestFile } from 'modules/shared/interface/files.interface';
import ModelMaterialService from './model_materials/model_materials.service';
import ModelColorService from './model_colors/model_colors.service';
import ImageService from 'modules/shared/modules/images/images.service';
import ModelImageService from './model_images/model_images.service';
import { ICreateModelImage, IModelImage } from './model_images/interface/model_images.interface';
import buildPagination from 'modules/shared/utils/paginationBuilder';
import flat from 'flat'
import BrandService from 'modules/brands/brands.service';
import { IColor } from 'modules/colors/interface/colors.interface';
import { IModelColor } from './model_colors/interface/model_colors.interface';
import { checkObject, generatePresignedUrl } from 'modules/shared/utils/s3';
import { IModelMaterial } from './model_materials/interface/model_materials.interface';
import DownloadsService from '../downloads/downloads.service';

export default class ModelService {
    private modelsDao = new ModelsDAO()
    private fileService = new FileService()
    private modelMaterialService = new ModelMaterialService()
    private modelColorService = new ModelColorService()
    private modelImageService = new ModelImageService()
    private imageService = new ImageService()
    private brandService = new BrandService()
    private downloadService = new DownloadsService()

    async create(
        data: ICreateModel,
        cover: IRequestFile,
        images: IRequestFile[],
        file: IRequestFile
    ): Promise<IModel> {
        // const yamoIdExist = await this.findByFilters({yamo_id});
        // if (yamoIdExist) throw new ErrorResponse(400, 'Bu Yamo Id allaqachon mavjud!')

        const { materials, colors, ...modelValues } = data

        // upload and create file
        const uploadedFile = await uploadFile(file, "files/products", s3Vars.filesBucket)
        const newFile = await this.fileService.create({ ...uploadedFile[0] })

        // generate unique slug
        data.slug = data.slug ? data.slug : generateSlug(data.name)
        const foundSlugs = await this.modelsDao.getBySlug(data.slug)
        if (foundSlugs && !isEmpty(foundSlugs)) data.slug = indexSlug(data.slug, foundSlugs.map(model => model.slug))

        // create model
        const model = await this.modelsDao.create({
            ...modelValues,
            file_id: newFile.id
        })

        // create materials
        if (materials.length > 1) {
            Promise.all(materials.map(async material_id => await this.modelMaterialService.create({ model_id: model.id, material_id })))
        } else if (materials.length == 1) {
            await this.modelMaterialService.create({ model_id: model.id, material_id: materials[0] })
        }

        // create colors
        if (colors.length > 1) {
            Promise.all(colors.map(async color_id => await this.modelColorService.create({ model_id: model.id, color_id })))
        } else if (colors.length == 1) {
            await this.modelColorService.create({ model_id: model.id, color_id: colors[0] })
        }

        // upload and create cover image
        const uploadedCover = await uploadFile(cover, "images/products", s3Vars.imagesBucket, fileDefaults.model_cover)
        const cover_image = await this.imageService.create({ ...uploadedCover[0] })
        await this.modelImageService.create({
            model_id: model.id,
            image_id: cover_image.id,
            is_main: true
        })

        // upload and create other images
        const uploadedImages = await uploadFile(images, "images/products", s3Vars.imagesBucket, fileDefaults.model)
        Promise.all(uploadedImages.map(async i => {
            const image = await this.imageService.create(i)
            await this.modelImageService.create({
                model_id: model.id,
                image_id: image.id,
                is_main: true
            })
        }))

        return model
    }

    async update(id: string, values: IUpdateModel): Promise<IModel> {

        const foundModel: IModel = await this.modelsDao.getById(id);
        if (isEmpty(foundModel)) throw new ErrorResponse(400, "Model was not found");


        const model: IModel = Object.keys(values).length ? await this.modelsDao.update(id, values) : foundModel

        return model
    }

    async updateByBrand(brand_id: string, values): Promise<IModel> {
        return await this.modelsDao.updateByBrand(brand_id, values)
    }

    async findAll(
        keyword: string,
        filters: IGetModelsQuery,
        sorts: IDefaultQuery
    ): Promise<{
        count: number;
        models: IModel[];
    }> {
        const models = await this.modelsDao.getAll(keyword, filters, sorts);

        const count = await this.count(keyword, filters)

        for (const [i, m] of models) models[i] = flat.unflatten(m)

        return { count, models }
    }

    async count(keyword, filters: IGetModelsQuery): Promise<number> {
        const data = await this.modelsDao.count(keyword, filters);
        return data[0] ? Number(data[0].count) : 0
    }

    async findOne(id: string): Promise<IModel> {
        const data = await this.modelsDao.getById(id);

        if (!data) throw new ErrorResponse(400, "Model was not found");

        const model = flat.unflatten(data)

        const file = await this.fileService.findOne(model.file_id)

        const filePublicData: IFilePublic = {
            name: file.name,
            size: file.size,
            ext: file.ext,
            mimetype: file.mimetype,
        }

        model['file'] = filePublicData

        model['images'].sort((a, b) => new Date(a['created_at']).valueOf() - new Date(b['created_at']).valueOf())

        return model
    }

    async findBySlug(slug: string): Promise<IModel> {
        const data = await this.modelsDao.getById(slug);

        if (!data) throw new ErrorResponse(400, "Model was not found");

        const model = flat.unflatten(data)

        const file = await this.fileService.findOne(model.file_id)

        const filePublicData: IFilePublic = {
            name: file.name,
            size: file.size,
            ext: file.ext,
            mimetype: file.mimetype,
        }

        model['file'] = filePublicData

        model['images'].sort((a, b) => new Date(a['created_at']).valueOf() - new Date(b['created_at']).valueOf())

        return model
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

        const model: IModel = await this.modelsDao.getById(model_id);
        if (!model) throw new ErrorResponse(400, "Model was not found");

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

        const result: IAddImageResult = {};

        if (cover) {
            const uploadedCover = await uploadFile(cover, "images/products", s3Vars.imagesBucket)
            const cover_image = await this.imageService.create({ ...uploadedCover[0] })
            await this.modelImageService.create({
                model_id,
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
                    await this.modelImageService.create({
                        model_id,
                        image_id: image.id,
                        is_main: false
                    })
                    result.images.push(image)
                }))
            } else {
                const image = await this.imageService.create(uploadedImages[0])
                await this.modelImageService.create({
                    model_id,
                    image_id: image.id,
                    is_main: false
                })
                result.images.push(image)
            }
        }

        return result
    }

    async updateFile(model_id: string, file: IRequestFile): Promise<IFile> {
        // find model and check existance
        const foundModel: IModel = await this.modelsDao.getById(model_id);
        if (!foundModel) throw new ErrorResponse(404, "Model was not found");
        // find current file of model
        const oldFile = await this.fileService.findOne(foundModel.file_id);

        // check if it exists in storage and delete if yes
        const fileExists = await checkObject(s3Vars.filesBucket, oldFile.key)
        if (fileExists) await deleteFile(s3Vars.filesBucket, oldFile.key)

        // upload new file and create add to db
        const uploadedFile = await uploadFile(file, "files/product-files", s3Vars.filesBucket)
        const newFile = await this.fileService.update(foundModel.file_id, { ...uploadedFile[0] })

        // connect model to new file
        await this.modelsDao.update(model_id, { file_id: newFile.id })

        return newFile
    }

    async addMaterials(model_id: string, materials: number[]): Promise<IModelMaterial[]> {
        const model: IModel = await this.modelsDao.getById(model_id);
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
        const foundModel: IModel = await this.modelsDao.getById(model_id);
        if (!foundModel) throw new ErrorResponse(400, "Model was not found");

        return await this.modelMaterialService.deleteByMaterialAndModel(foundModel.id, material_id)
    }

    async removeColor(model_id: string, color_id: number): Promise<number> {
        const foundModel: IModel = await this.modelsDao.getById(model_id);
        if (!foundModel) throw new ErrorResponse(400, "Model was not found");

        return await this.modelColorService.deleteByColorAndModel(foundModel.id, color_id)
    }

    async deleteById(model_id: string): Promise<number> {
        const model = await this.modelsDao.getById(model_id)

        if (!model) throw new ErrorResponse(400, "Model was not found");

        // await this.interactionService.deleteById(model.interaction_id)

        const modelImages = await this.modelImageService.findByModel(model_id)

        for await (const model_image of modelImages) {
            const image = await this.imageService.findOne(model_image.image_id)
            await deleteFile(s3Vars.imagesBucket, image.src)
            await this.imageService.delete(model_image.image_id)
        }

        const file = await this.fileService.findOne(model.file_id)
        await deleteFile(s3Vars.filesBucket, file.src)
        await this.fileService.delete(file.id)

        return await this.modelsDao.deleteById(model_id)
    }

    async download(model_id: string, profile_id: string): Promise<string> {
        const model = await this.modelsDao.getById(model_id)
        if (!model) throw new ErrorResponse(400, "Model was not found");

        const file = await this.fileService.findOne(model.file_id)
        if (!file) throw new ErrorResponse(400, "File was not found");

        const presignedUrl = generatePresignedUrl(file.key)

        await this.downloadService.create({
            model_id: model.id,
            user_id: profile_id
        })

        return presignedUrl
    }

    async delete(id: string): Promise<number> {
        const model = await this.findOne(id);
        return await this.modelsDao.deleteById(id);
    }

    async deleteByBrandId(brand_id: string): Promise<number> {
        const brand = await this.brandService.findOne(brand_id)
        return await this.modelsDao.deleteByBrandId(brand_id);
    }
}