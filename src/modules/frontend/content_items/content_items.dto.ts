import { IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { ICreateFrontendContentItemBody } from "./content_items.interface";

export class CreateContentItemDTO implements ICreateFrontendContentItemBody {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsString()
  primary_text?: string;

  @IsOptional()
  @IsString()
  secondary_text?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsUUID()
  section_id: string;

  @IsOptional()
  @IsUUID()
  type_id: string;

  @IsOptional()
  @IsUUID()
  website_id: string;
}