import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { defaults } from "../defaults/defaults";
import { s3Vars } from "../../../config/conf";

function getS3() {
  return new S3Client({
    region: s3Vars.region,
    endpoint: s3Vars.privateEndpoint,
    credentials: {
      accessKeyId: s3Vars.accessKeyId,
      secretAccessKey: s3Vars.secretAccessKey
    }
  });
}

export const checkObject = async (bucket, key): Promise<boolean> => {
  try {
    const s3 = getS3();

    await s3.send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

    return true
  } catch (err) {
    console.log(err.code);
    return false
  }
}

export const s3upload = async (file, { bucket_name, filename }) => {
  try {
    const s3 = getS3();

    const params = {
      Bucket: String(bucket_name),
      Key: String(filename),
      Body: file,
    };

    const upload = await s3.send(new PutObjectCommand(params));

    console.log(`Upload success:  ${filename}`);
  } catch (error) {
    console.log(error);
  }
}

export const s3delete = async (bucket_name: string, filename: string) => {
  try {
    const s3 = getS3();

    const params: {
      Bucket: string;
      Key: string;
    } = {
      Bucket: String(bucket_name),
      Key: String(filename)
    };

    const deleted = await s3.send(new DeleteObjectCommand(params));

    console.log('Deleted', deleted);
  } catch (error) {
    console.log(error);
  }
}


export const s3deleteMany = async (bucket_name: string, objects: { Key: string }[]) => {
  try {
    const s3 = getS3();

    const params = {
      Bucket: String(bucket_name),
      Delete: {
        Objects: objects
      }
    };

    const { Deleted } = await s3.send(new DeleteObjectsCommand(params));

    console.log(`Deleted ${Deleted.length} files`);
  } catch (error) {
    console.log(error);
  }
}

export const generatePresignedUrl = async (filesrc: string): Promise<string> => {
  const s3 = getS3()

  const command = new GetObjectCommand({
    Bucket: process.env.S3_FILES_BUCKET_NAME,
    Key: filesrc,
  })

  const url = await getSignedUrl(s3, command, { expiresIn: defaults.s3UrlExpiresIn })

  return url;
}