import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProjectDTO {
  @IsString()
  @IsDefined()
  name: string;
}

export class UpdateProjectDTO {
  @IsString()
  @IsOptional()
  name: string;
}

export class GetProjectsQueryDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  user_id: string;
}