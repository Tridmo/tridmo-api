import { NextFunction, Request, Response } from 'express';
import AuthService from './auth.service';
import { ConfirmOtpDTO, ResendOtpDTO, SigninDTO, SignupDTO } from './dto/auth.dto';
import { IRefreshToken, ISignin } from './interface/auth.interface';
import supabase from '../../database/supabase/supabase';
import { reqT } from '../shared/utils/language';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: SignupDTO = req.body;

      await this.authService.signup(userData);

      res.status(201).json({ success: true, message: reqT('signup_success_check_email') });
    } catch (error) {
      next(error);
    }
  };

  public resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const otpData: ResendOtpDTO = req.body;

      const data = await this.authService.resendOtp(otpData.email);

      res.status(200).json({ success: true, message: reqT('check_email_to_verify') });
    } catch (error) {
      next(error);
    }
  };
  public signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.authService.signIn(req.body);

      res.status(201).json({ success: true, data, message: reqT('login_success') });
    } catch (error) {
      next(error);
    }
  };
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: IRefreshToken = req.body;

      const accessToken = await this.authService
        .refreshToken(data.token);

      res.status(201).json({ success: true, data: { accessToken }, message: 'Access token generated' });
    } catch (error) {
      next(error);
    }
  };

}

export default AuthController;
