import { NextFunction, Request, Response } from "express";
import { ICreateFile, ICreateImage, IImage } from "../../interface/files.interface";
import ImagesDAO from "./dao/images.dao";
import { s3Vars } from "../../../../config/conf";
import { deleteFile } from "../../utils/fileUpload";

export default class ImageService {
  private imagesDao = new ImagesDAO()
  async create({ src, ext, name, key, mimetype, size }: ICreateImage): Promise<IImage> {
    const image = await this.imagesDao.create({
      src, key, ext, name, mimetype, size
    })

    return image
  }
  async findOne(id: string): Promise<IImage> {
    return await this.imagesDao.getById(id)
  }
  async delete(id: string): Promise<number> {
    const image = await this.findOne(id);
    await deleteFile(s3Vars.imagesBucket, image.src)
    return await this.imagesDao.deleteById(id)
  }
}