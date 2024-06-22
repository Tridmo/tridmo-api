import { v4 as uuidv4 } from "uuid";
import { s3delete, s3upload } from "./s3";
import { getExtension } from "./getExtension";
import processImage from "./compressFile";
import { s3Vars } from "../../../config/conf";
import { IFile, IImage } from "../interface/files.interface";
import mimeTypes from 'mime-types';

export const uploadFile = async (files, folder: string, bucketName: string, fileName?: string, dimensions?): Promise<Array<IImage | IFile>> => {
  const arr = []
  let bucketUrl: string;

  if (bucketName == s3Vars.imagesBucket) {
    bucketUrl = `${s3Vars.publicImagesEndpoint}`
  }
  else if (bucketName == s3Vars.filesBucket) {
    bucketUrl = `${s3Vars.privateEndpoint}/${s3Vars.filesBucket}`
  }

  if (Array.isArray(files)) {
    for await (const item of files) {
      let file = item;

      if (dimensions) file = await processImage(file, dimensions)

      const ext = mimeTypes.extension(file.mimetype)

      const filename = `${folder}/${(fileName || uuidv4()) + '.' + ext}`

      await s3upload(file.data, { bucket_name: bucketName, filename })
      const f = {
        src: filename,
        key: filename,
        ext,
        name: file.name,
        size: file.size,
        mimetype: file.mimetype
      }
      arr.push(f)
    }
  } else {
    let file = files

    if (dimensions) file = await processImage(file, dimensions)

    const ext = mimeTypes.extension(file.mimetype)
    const filename = `${folder}/${(fileName || uuidv4()) + '.' + ext}`

    await s3upload(file.data, { bucket_name: bucketName, filename })
    const f = {
      src: filename,
      key: filename,
      ext,
      name: file.name,
      size: file.size,
      mimetype: file.mimetype
    }
    arr.push(f)
  }

  return arr
}

export const deleteFile = async (bucket: string, key: string) => {

  await s3delete(bucket, key)
}


