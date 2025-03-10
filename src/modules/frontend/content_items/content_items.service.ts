import { nanoid } from "nanoid";
import { s3Vars } from "../../../config";
import { deleteFile, uploadFile } from "../../shared/utils/fileUpload";
import { ContentTypesService } from "../content_types/content_types.service";
import { PageSectionsService } from "../page_sections/page_sections.service";
import { WebsitesService } from "../websites/websites.service";
import {
  ICreateFrontendContentItem,
  IFrontendContentItem,
  IFilterFrontendContentItem,
  IContentItemImages,
} from "./content_items.interface";
import { FrontendContentItemsRepository } from "./content_items.repository";
import ErrorResponse from "../../shared/utils/errorResponse";
import { reqT } from "../../shared/utils/language";
import { fileDefaults } from "../../shared/defaults/defaults";
import { v4 as uuid4 } from 'uuid'
import flat from 'flat'
import { getFirst } from "../../shared/utils/utils";
import { IImage, IRequestFile } from "../../shared/interface/files.interface";

export class ContentItemsService {
  private readonly repository = new FrontendContentItemsRepository();
  private readonly typesService = new ContentTypesService();
  private readonly sitesService = new WebsitesService();
  private readonly sectionsService = new PageSectionsService();

  async createContentItem(data: ICreateFrontendContentItem, images: IContentItemImages): Promise<IFrontendContentItem> {

    const type = await this.typesService.getContentTypeById(data.type_id)
    const website = await this.sitesService.getWebsiteById(data.website_id)
    const section = await this.sectionsService.getPageSectionById(data.section_id)

    const id = uuid4();

    const uploads = await this.createImages({ id, website: website.name, type: type.name, section: section.name }, images);

    return await this.repository.create({
      id,
      ...data,
      ...uploads
    });
  }


  async getContentItemById(id: string): Promise<IFrontendContentItem | null> {
    return flat.unflatten(await this.repository.findById(id));
  }

  async getAllContentItems(
    filters?: IFilterFrontendContentItem
  ): Promise<IFrontendContentItem[]> {
    return await this.repository.findAll(filters);
  }

  async updateContentItem(
    id: string,
    data: Partial<ICreateFrontendContentItem>,
    images?: Partial<IContentItemImages>
  ): Promise<IFrontendContentItem> {

    const item = await this.getContentItemById(id);

    if (!item) throw new ErrorResponse(404, 'Item not found')

    if (images) {
      const uploads = await this.updateImages(item, images)
      data = { ...data, ...uploads }
    }
    return await this.repository.update(id, data);
  }

  async deleteContentItem(id: string): Promise<IFrontendContentItem> {
    return await this.repository.delete(id);
  }

  private async uploadContentItemImage(
    item: { id: string, website: string, type: string, section: string },
    image: IRequestFile,
    imageType: 'desktop' | 'tablet' | 'mobile'
  ): Promise<IImage> {
    return getFirst(
      await uploadFile({
        files: image,
        folder: `images/ui/${item.website}`,
        fileName: `${item.id}__${item.type}__${item.section}__${imageType}`,
        bucketName: s3Vars.imagesBucket,
        dimensions: item.type == 'banner' ? fileDefaults[`banner_${imageType}_image`] : undefined,
        compress: fileDefaults.banner_image_compression
      })
    ) as IImage;
  }

  private async createImages(item: { id: string, website: string, type: string, section: string }, { desktop_image, tablet_image, mobile_image }: IContentItemImages) {
    const desktopUpload = await this.uploadContentItemImage(item, desktop_image, 'desktop')
    const tabletUpload = await this.uploadContentItemImage(item, tablet_image, 'tablet')
    const mobileUpload = await this.uploadContentItemImage(item, mobile_image, 'mobile')

    return {
      desktop_image: desktopUpload.src,
      tablet_image: tabletUpload.src,
      mobile_image: mobileUpload.src,
    }
  }

  private async updateImages(item: IFrontendContentItem, { desktop_image, tablet_image, mobile_image }: Partial<IContentItemImages>) {
    let result: { desktop_image?: string, tablet_image?: string, mobile_image?: string } = {};

    const itemData = {
      id: item.id,
      website: item.website.name,
      type: item.type.name,
      section: item.section.name,
    }

    if (desktop_image) {
      await deleteFile(s3Vars.imagesBucket, item.desktop_image)
      result.desktop_image = (await this.uploadContentItemImage(itemData, desktop_image, 'desktop')).src
    }
    if (tablet_image) {
      await deleteFile(s3Vars.imagesBucket, item.tablet_image)
      result.tablet_image = (await this.uploadContentItemImage(itemData, tablet_image, 'tablet')).src
    }
    if (mobile_image) {
      await deleteFile(s3Vars.imagesBucket, item.mobile_image)
      result.mobile_image = (await this.uploadContentItemImage(itemData, mobile_image, 'mobile')).src
    }

    return result;
  }
}
