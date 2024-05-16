import { ICreateRoleAccessModule } from './access_modules.interface';
import { IsDefined, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';


export class CreateRoleAccessModuleDTO implements ICreateRoleAccessModule {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  access_module_id: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  role_id: string;
} 