import { v4 as uuidv4 } from "uuid";
import { s3delete, s3upload } from "./s3";
import { getExtension } from "./getExtension";
import processImage from "./compressFile";
import { s3Vars } from "../../../config";
import { IFile, IImage } from "../interface/files.interface";
import mimeTypes from 'mime-types';
import compressFile from "./compressFile";
import logger from "../../../lib/logger";

interface FileUploadArgs {
  files,
  folder: string,
  bucketName: string,
  fileName?: string,
  extension?: string,
  dimensions?,
  useIndexPrefix?: boolean,
  useIndexAsName?: boolean,
  compress?: number,
  prefix?: string,
  index?: number,
}

export const uploadFile = async (
  { files, folder, bucketName, fileName, extension, dimensions, compress, useIndexAsName, useIndexPrefix, prefix }: FileUploadArgs
): Promise<Array<IImage | IFile>> => {
  try {
    const arr = []

    if (Array.isArray(files)) {
      for await (let [index, file] of files.entries()) {
        const f = await processFile({ files: file, compress, folder, bucketName, fileName, extension, dimensions, useIndexAsName, useIndexPrefix, prefix, index })
        arr.push(f)
      }
    } else {
      const f = await processFile({ files, folder, compress, bucketName, fileName, extension, dimensions, useIndexAsName, useIndexPrefix, prefix })
      arr.push(f)
    }

    return arr
  } catch (error) {
    logger.error("File Upload Error: ", error);
  }
}

async function processFile(
  { files, folder, bucketName, fileName, extension, dimensions, compress }: FileUploadArgs
) {
  let file = files
  if (dimensions || compress) file = await processImage(file, dimensions || undefined, { quality: compress });

  const ext = extension || mimeTypes.extension(file.mimetype) || getExtension(file.name)
  const filename = `${folder}/${(fileName || uuidv4())}`
  const fileNameWithExt = filename + '.' + ext

  const finalFileName = ext == 'rar' || ext == '.rar' ? filename : fileNameWithExt

  await s3upload(file.data, { bucket_name: bucketName, filename: fileNameWithExt })
  const f = {
    src: fileNameWithExt,
    key: fileNameWithExt,
    ext,
    name: file.name,
    size: file.size,
    mimetype: ext == 'webp' ? 'image/webp' : file.mimetype
  }

  return f;
}

export const deleteFile = async (bucket: string, key: string) => {

  await s3delete(bucket, key)
}


