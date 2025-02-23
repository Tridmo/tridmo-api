import { NextFunction, Request, Response } from "express";
import { ICreateFile, IFile, IUpdateFile } from "../../interface/files.interface";
import FilesDAO from "./dao/files.dao";
import { checkObject } from "../../../shared/utils/s3";
import { s3Vars } from "../../../../config";

export default class FileService {
  private filesDao = new FilesDAO()

  async create({ src, key, ext, name, mimetype, size }: ICreateFile): Promise<IFile> {
    const file = await this.filesDao.create({
      src, key, ext, name, mimetype, size
    })
    return file
  }
  async update(id, { ...values }: IUpdateFile): Promise<IFile> {
    const file = await this.filesDao.update(id, {
      ...values
    })
    return file
  }
  async findOne(id: string): Promise<IFile> {
    return await this.filesDao.getById(id)
  }
  // async checkS3Existance(): Promise<void> {
  //   const files = await this.filesDao.getAll()
  //   for (const file of files) {
  //     const exists = await checkObject(s3Vars.filesBucket, file.key)
  //     if (!exists) {
  //       await this.productsService.updateByFile(file.id, {file_exists: false})
  //     }
  //   }
  // }
  async delete(id: string) {
    await this.filesDao.deleteById(id)
  }
}