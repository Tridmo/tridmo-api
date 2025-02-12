export type ProductImageType = 'image' | 'info_image' | 'video';

export interface IProductImage {
  id: string;
  product_id: string;
  src: string;
  is_cover: boolean;
  index: number;
  type: ProductImageType;
}

export interface ICreateProductImage {
  product_id: string;
  src: string;
  is_cover?: boolean;
  index?: number;
  type?: ProductImageType;
}

export interface IUpdateProductCover {
  src: string;
  type?: ProductImageType;
}