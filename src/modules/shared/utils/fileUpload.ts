import { v4 as uuidv4 } from "uuid";
import { s3delete, s3upload } from "./s3";
import { getExtension } from "./getExtension";
import processImage from "./compressFile";
import { s3Vars } from "../../../config/conf";
import { IFile, IImage } from "../interface/files.interface";
import mimeTypes from 'mime-types';

interface FileUploadArgs {
  files,
  folder: string,
  bucketName: string,
  fileName?: string,
  dimensions?,
  useIndexPrefix?: boolean,
  useIndexAsName?: boolean,
  prefix?: string,
}

export const uploadFile = async (
  { files, folder, bucketName, fileName, dimensions, useIndexAsName, useIndexPrefix, prefix }: FileUploadArgs
): Promise<Array<IImage | IFile>> => {
  try {
    const arr = []
    let bucketUrl: string;

    if (bucketName == s3Vars.imagesBucket) {
      bucketUrl = `${s3Vars.publicImagesEndpoint}`
    }
    else if (bucketName == s3Vars.filesBucket) {
      bucketUrl = `${s3Vars.privateEndpoint}/${s3Vars.filesBucket}`
    }

    if (Array.isArray(files)) {
      for await (let [index, file] of files.entries()) {
        if (dimensions) file = await processImage(file, dimensions);

        const ext = mimeTypes.extension(file.mimetype) || getExtension(file.name);

        let filename = `${folder}/${useIndexAsName ? String(index) : (fileName || uuidv4()) + '.' + ext}`;

        if (prefix) filename = prefix + filename;
        if (useIndexPrefix) filename = index + filename;

        await s3upload(file.data, { bucket_name: bucketName, filename });
        const f = {
          src: filename,
          key: filename,
          ext,
          name: file.name,
          size: file.size,
          mimetype: file.mimetype
        };
        arr.push(f);
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
  } catch (error) {
    console.log("UPLOAD ERROR: ", error);
  }
}

export const deleteFile = async (bucket: string, key: string) => {

  await s3delete(bucket, key)
}


