import { ICreateImageTag, IImageTag } from 'modules/image_tags/interface/image_tags.interface';
import { IDefaultQuery } from './../../modules/shared/interface/query.interface';
import InteriorsDAO from "./dao/interiors.dao";
import { ICreateInterior, IInterior, IUpdateInterior } from "./interface/interiors.interface";
import { IRequestFile } from 'modules/shared/interface/files.interface';
import generateSlug, { indexSlug } from 'modules/shared/utils/generateSlug';
import { isEmpty } from 'lodash';
import InteriorImageService from './interior_images/interior_images.service';
import { fileDefaults } from 'modules/shared/defaults/defaults';
import { s3Vars } from 'config/conf';
import ImageService from 'modules/shared/modules/images/images.service';
import { uploadFile } from 'modules/shared/utils/fileUpload';
import InteriorModelsService from './interior_models/interior_models.service';
import { isUUID } from 'class-validator';
import ModelService from 'modules/models/models.service';
import ImageTagsService from 'modules/image_tags/image_tags.service';

export default class InteriorService {
    private interiorsDao = new InteriorsDAO()
    private interiorImageService = new InteriorImageService()
    private interiorModelService = new InteriorModelsService()
    private imageService = new ImageService()
    private modelService = new ModelService()
    private imageTagService = new ImageTagsService()

    async create(
        data: ICreateInterior,
        cover: IRequestFile,
        images: IRequestFile[],
    ): Promise<IInterior> {

        const { tags, ...interiorValues } = data

        // generate unique slug
        data.slug = data.slug || generateSlug(data.name)
        const foundSlugs = await this.interiorsDao.getBySlug(data.slug)
        if (foundSlugs && !isEmpty(foundSlugs)) data.slug = indexSlug(data.slug, foundSlugs.map(model => model.slug))

        const interior = await this.interiorsDao.create({
            ...interiorValues
        })

        // upload and create cover image
        const uploadedCover = await uploadFile(cover, "images/products", s3Vars.imagesBucket, fileDefaults.model_cover)
        const cover_image = await this.imageService.create({ ...uploadedCover[0] })
        await this.interiorImageService.create({
            interior_id: interior.id,
            image_id: cover_image.id,
            is_main: true
        })

        // upload and create other images
        const uploadedImages = await uploadFile(images, "images/products", s3Vars.imagesBucket, fileDefaults.interior)
        Promise.all(uploadedImages.map(async i => {
            const image = await this.imageService.create(i)
            await this.interiorImageService.create({
                interior_id: interior.id,
                image_id: image.id,
                is_main: true
            })
        }))

        if (tags.length) {
            tags.map(async tag => {
                const modelUrl = tag.text.split('/')
                let identifier = modelUrl[modelUrl.length - 1]

                if (!isUUID(identifier)) {
                    const model = await this.modelService.findBySlug(identifier);
                    identifier = model.id
                }

                const newTag = await this.imageTagService.create({
                    image_id: '',
                    ...tag
                })

                await this.interiorModelService.create({
                    model_id: identifier,
                    interior_id: interior.id,
                    tag_id: newTag.id
                })
            })
        }

        return interior
    }

    async update(id: string, { category_id }: IUpdateInterior): Promise<IInterior> {
        const interior = await this.interiorsDao.update(id, { category_id })
        return interior
    }

    async findAll(keyword: string, sorts: IDefaultQuery, categories, styles, colors, filters) {
        const interiors = await this.interiorsDao.getAll(keyword, sorts, categories, styles, colors, filters);
        return interiors
    }

    async count(keyword, filters, categories, styles, colors) {
        const data = await this.interiorsDao.count(keyword, filters, categories, styles, colors);
        console.log(data);

        return data[0] ? data[0].count : 0
    }

    async findOne(id): Promise<IInterior> {
        const interior = await this.interiorsDao.getById(id);
        return interior
    }

    async findBySlug(slug): Promise<IInterior> {
        const interior = await this.interiorsDao.getBySlug(slug);
        return interior
    }

    async findByProduct(product_id): Promise<IInterior> {
        const interior = await this.interiorsDao.getByProductId(product_id);
        return interior
    }

    async delete(id) {
        await this.interiorsDao.deleteById(id);
    }
}