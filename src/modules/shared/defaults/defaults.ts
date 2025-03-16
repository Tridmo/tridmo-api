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
  reqDesktopImageName: "desktop_image",
  reqTabletImageName: "tablet_image",
  reqMobileImageName: "mobile_image",
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
  category_image: {
    width: 100,
    height: 100
  },
  brand_image_compression: 80,
  brand_image: {
    width: 400,
    height: 400
  },
  banner_image_compression: 90,
  banner_desktop_image: {
    width: 1920,
    height: 380
  },
  banner_tablet_image: {
    width: 1280,
    height: 380
  },
  banner_mobile_image: {
    width: 768,
    height: 380
  },
};
