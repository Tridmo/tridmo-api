import { NextFunction, Request, Response } from "express";
import { ICreateFile, IFile, IUpdateFile } from "../../interface/files.interface";
import FilesDAO from "./dao/files.dao";
import { checkObject } from "../../../shared/utils/s3";
import { s3Vars } from "../../../../config";
import logger from "../../../../lib/logger";

export default class FileService {
  private filesDao = new FilesDAO()

  async create({ src, key, ext, name, mimetype, size }: ICreateFile): Promise<IFile> {
    logger.info('Creating file record', { 
      name, 
      ext, 
      mimetype, 
      size,
      key: key?.substring(0, 20) + '...' // Partially show key for debugging
    });

    const file = await this.filesDao.create({
      src, key, ext, name, mimetype, size
    });

    logger.info('File record created successfully', { 
      fileId: file.id, 
      name: file.name 
    });

    return file;
  }

  async update(id, { ...values }: IUpdateFile): Promise<IFile> {
    logger.info('Updating file record', { 
      fileId: id,
      updateFields: Object.keys(values) 
    });

    const file = await this.filesDao.update(id, {
      ...values
    });

    logger.info('File record updated successfully', { 
      fileId: id, 
      name: file.name 
    });

    return file;
  }

  async findOne(id: string): Promise<IFile> {
    logger.debug('Fetching file record', { fileId: id });

    const file = await this.filesDao.getById(id);
    
    if (file) {
      logger.debug('File record found', { 
        fileId: id, 
        name: file.name 
      });
    } else {
      logger.warn('File record not found', { fileId: id });
    }

    return file;
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
    logger.info('Deleting file record', { fileId: id });

    // Get file info before deletion for logging
    const file = await this.filesDao.getById(id);
    
    await this.filesDao.deleteById(id);

    logger.info('File record deleted successfully', { 
      fileId: id, 
      fileName: file?.name 
    });
  }
}