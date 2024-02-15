export interface IRequestFile {
  name: string;
  data: Buffer;
  size: bigint | number;
  encoding: string;
  tempFilePath: string;
  truncated: boolean;
  mimetype: string;
  md5: string;
  mv(path: string, callback: (err: any) => void): void;
  mv(path: string): Promise<void>;
}

export interface IFile {
  id: string;
  name: string;
  src: string;
  key: string;
  size: string;
  ext: string;
  mimetype: string;
  created_at: Date;
  updated_at: Date;
}
export interface IFilePublic {
  name: string;
  size: string;
  ext: string;
  mimetype: string;
}

export interface IImage {
  id: string;
  name: string;
  src: string;
  key: string;
  size: string;
  ext: string;
  mimetype: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateFile {
  name: string;
  src: string;
  key: string;
  size: string;
  ext: string;
  mimetype: string;
}
export interface IUpdateFile {
  name?: string;
  src?: string;
  key?: string;
  size?: string;
  ext?: string;
  mimetype?: string;
}
export interface ICreateImage {
  name: string;
  src: string;
  key: string;
  size: string;
  ext: string;
  mimetype: string;
}