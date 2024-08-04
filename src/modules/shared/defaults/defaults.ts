import { IDefaultQuery } from "../interface/query.interface";

export const defaultQueryValues: IDefaultQuery = {
  limit: 16,
  offset: 0,
  page: 0,
  order: "DESC",
  orderBy: "created_at"
}

export const defaults = {
  rangeSplitter: "and",
  reqImagesName: "images",
  reqImageName: "image",
  reqFilesName: "files",
  reqFileName: "file",
  reqCoverName: "cover",
  reqPresentationName: 'presentation',
  recentViewsLimit: 5,
  defaultLimit: 12,
  s3UrlExpiresIn: 5 * 60,
}


export const fileDefaults = {
  avatar: {
    width: 200,
    height: 200,
  },

  interior: {
    width: 1500,
    height: 1500
  },
  interior_cover: {
    width: 600,
    height: 600
  },
  model: {
    width: 1200,
    height: 1200
  },
  model_cover: {
    width: 500,
    height: 500
  },
};
