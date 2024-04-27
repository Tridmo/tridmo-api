import { IsDefined, IsOptional, IsString } from "class-validator";
import { ICreateNotification } from "./notifications.interface";
import { IsArrayOrStringifiedArray, IsBooleanOrStringifiedBoolean } from "../shared/custom/validators";

export class CreateNotificationDTO {
  @IsString()
  @IsDefined()
  action_id: string;

  @IsString()
  @IsOptional()
  interior_id?: string;

  @IsString()
  @IsOptional()
  model_id?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsDefined()
  notifier_id: string;

  @IsString()
  @IsDefined()
  recipient_id: string;
}

export class MarkManyNotificationDTO {
  @IsDefined()
  @IsArrayOrStringifiedArray()
  notifications: string[];
}