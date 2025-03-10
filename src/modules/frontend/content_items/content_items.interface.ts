import { IRequestFile } from "../../shared/interface/files.interface";
import { IFrontendContentType } from "../content_types/content_types.interface";
import { IFrontendPageSection } from "../page_sections/page_sections.interface";
import { IWebsite } from "../websites/websites.interface";

export interface IFrontendContentItem {
  id: string;
  type_id: string;
  type: IFrontendContentType;
  website_id: string;
  website: IWebsite;
  section_id: string;
  section: IFrontendPageSection;
  url?: string;
  title: string;
  primary_text: string;
  secondary_text: string;
  desktop_image?: string;
  tablet_image?: string;
  mobile_image?: string;
  position?: number;
}

export interface ICreateFrontendContentItem {
  id?: string;
  type_id: string;
  website_id: string;
  section_id: string;
  url?: string;
  title?: string
  primary_text?: string
  secondary_text?: string
  desktop_image?: string;
  tablet_image?: string;
  mobile_image?: string;
  position?: number;
}

export interface ICreateFrontendContentItemBody {
  type_id: string;
  website_id: string;
  section_id: string;
  url?: string;
  title?: string;
  primary_text?: string;
  secondary_text?: string;
  position?: number;
}

export interface IContentItemImages {
  desktop_image: IRequestFile;
  tablet_image: IRequestFile;
  mobile_image: IRequestFile;
}

export interface IFilterFrontendContentItem {
  type?: string;
  type_id?: string;
  website?: string;
  website_id?: string;
  section?: string;
  section_id?: string;
}
