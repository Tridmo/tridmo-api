import { IModel } from "../../interface/models.interface";
import { IColor } from "../../../colors/interface/colors.interface";

export interface IModelColor {
  id: string;
  model_id: string;
  color_id: number;
  created_at: Date;
  updated_at: Date;
  model?: IModel;
  color?: IColor;
}

export interface ICreateModelColor {
  model_id: string;
  color_id: number;
}