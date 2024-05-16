import { IModel } from "../../models.interface";
import { IMaterial } from "../../../materials/materials.interface";

export interface IModelMaterial {
  id: string;
  model_id: string;
  material_id: number;
  created_at: Date;
  updated_at: Date;
  model?: IModel;
  material?: IMaterial;
}

export interface ICreateModelMaterial {
  model_id: string;
  material_id: number;
}