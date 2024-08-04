import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ICreateCommentBody, IUpdateComment } from './comments.interface';
import { IsOneOf } from '../shared/custom/validators';

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
  @IsOneOf(['interiors', 'models'])
  entity_source: 'interiors' | 'models';

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
