import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsOptional,
  IsDate,
  IsDateString
} from 'class-validator';
import {
  IResendOtp,
  ISignin,
  ISignup,
} from '../interface/auth.interface';
import { IConfirmOtp } from '../interface/otps.interface';

export class SignupDTO implements ISignup {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  full_name: string;

  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  birth_date: Date;
}

export class SigninDTO implements ISignin {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class ConfirmOtpDTO implements IConfirmOtp {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  code: number;
}

export class ResendOtpDTO implements IResendOtp {
  @IsDefined()
  @IsNotEmpty()
  @IsEmail()
  email: string;

}