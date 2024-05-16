import { IsNumberOrStringifiedNumber } from '../../shared/custom/validators';
import { ICreateRole, ICreateUserRole } from './roles.interface';
import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDTO implements ICreateRole {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  description: string;
}


export class UpdateRoleDTO implements ICreateRole {
  @IsString()
  @MaxLength(64)
  name: string;

  @IsString()
  @MaxLength(64)
  description: string;
}


export class CreateUserRoleDTO implements ICreateUserRole {
  @IsNumberOrStringifiedNumber()
  @IsDefined()
  role_id: number;
}