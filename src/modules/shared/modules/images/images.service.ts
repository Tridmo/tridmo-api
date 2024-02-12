import { NextFunction, Request, Response } from "express";
import { ICreateFile, ICreateImage, IImage } from "../../interface/files.interface";
import ImagesDAO from "./dao/images.dao";

export default class ImageService {
  private imagesDao = new ImagesDAO()
  async create({ src, ext, name, mimetype, size }: ICreateImage): Promise<IImage> {
    const image = await this.imagesDao.create({
      src, ext, name, mimetype, size
    })

    return image
  }
  async findOne(id: number): Promise<IImage> {
    return await this.imagesDao.getById(id)
  }
  async delete(id: number) {
    await this.imagesDao.deleteById(id)
  }
}