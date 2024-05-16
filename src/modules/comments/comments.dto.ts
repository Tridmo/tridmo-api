import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ICreateCommentBody, IUpdateComment } from './comments.interface';

export class CreateCommentDTO implements ICreateCommentBody {
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  entity_id: string;

  @IsOptional()
  @IsString()
  parent_id: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  entity_source: string;

  @IsString()
  @IsDefined()
  @IsNotEmpty()
  text: string;
}

export class UpdateCommentDTO implements IUpdateComment {
  @IsOptional()
  @IsString()
  text: string;
}
