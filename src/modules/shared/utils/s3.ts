import { S3 } from "aws-sdk"
import { defaults } from "../defaults/defaults";
import { s3Vars } from "../../../config/conf";

function getS3() {
  return new S3({
    region: s3Vars.region,
    endpoint: s3Vars.provateEndpoint,
    signatureVersion: 'v4',
    credentials: {
      accessKeyId: s3Vars.accessKeyId,
      secretAccessKey: s3Vars.secretAccessKey
  }
  });
}

export const checkObject = async (bucket, key): Promise<boolean> => {
  try {
    const s3 = getS3();

    await s3.headObject({
      Bucket: bucket,
      Key: key,
    }).promise();

    return true
  } catch (err) {
    console.log(err.code);
    return false
  }
}

export const s3upload = async (file, { bucket_name, filename }) => {
  try {
    const s3 = getS3();

    const params: {
      Bucket: string;
      Key: string;
      Body: any;
    } = {
      Bucket: String(bucket_name),
      Key: String(filename),
      Body: file,
    };

    const upload = await s3.upload(params).promise();

    console.log('Success', upload);
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

    const deleted = await s3.deleteObject(params).promise();

    console.log('Deleted', deleted);
  } catch (error) {
    console.log(error);
  }
}

export const generatePresignedUrl = (filesrc: string): string => {
  const s3 = getS3()

  const params: {
    Bucket: string;
    Key: string;
    Expires: number;
  } = {
    Bucket: process.env.S3_FILES_BUCKET_NAME,
    Key: filesrc,
    Expires: defaults.s3UrlExpiresIn
  };

  return s3.getSignedUrl('getObject', params)
}