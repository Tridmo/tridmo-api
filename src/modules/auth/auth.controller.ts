import { NextFunction, Request, Response } from 'express';
import AuthService from './auth.service';
import { ConfirmOtpDTO, ResendOtpDTO, SigninDTO, SignupDTO } from './auth.dto';
import { IRefreshToken, ISignin } from './interface/auth.interface';
import supabase from '../../database/supabase/supabase';
import { reqT } from '../shared/utils/language';
import { CustomRequest } from '../shared/interface/routes.interface';
import ErrorResponse from '../shared/utils/errorResponse';
import { server } from '../../config';
import { isDevelopment } from '../shared/utils/nodeEnv';
import { resetPasswordRedirectRoute } from './variables';
import logger from '../../lib/logger';

class AuthController {
  public authService = new AuthService();

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: SignupDTO = req.body;

      logger.info('User signup attempt', { 
        email: userData.email?.substring(0, 3) + '***', // Partially obscure email
        ip: req.ip 
      });

      const data = await this.authService.signup(userData);

      logger.info('User signup successful', { 
        userId: data.user?.id,
        email: userData.email?.substring(0, 3) + '***'
      });

      res.status(201).json({
        success: true,
        message: reqT('login_success'),
        data
      });

      // res.status(201).json({ success: true, message: reqT('signup_success_check_email') });
    } catch (error) {
      logger.warn('User signup failed', { 
        email: req.body.email?.substring(0, 3) + '***',
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

  public resendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const otpData: ResendOtpDTO = req.body;

      logger.info('OTP resend requested', { 
        email: otpData.email?.substring(0, 3) + '***',
        ip: req.ip 
      });

      const data = await this.authService.resendOtp(otpData.email);

      res.status(200).json({ success: true, message: reqT('check_email_to_verify') });
    } catch (error) {
      logger.warn('OTP resend failed', { 
        email: req.body.email?.substring(0, 3) + '***',
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

  public verified = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('User verification sync to chat', { userId: req.user.profile?.id });
      
      await this.authService.syncToChat(req.user.profile);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public signIn = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('User signin attempt', { 
        email: req.body.email?.substring(0, 3) + '***',
        role: req.params.role,
        company: req.headers['x-user-company-name'],
        ip: req.ip 
      });

      const data = await this.authService.signIn({ ...req.body, role_name: req.params.role, company: req.headers['x-user-company-name'] });
      
      logger.info('User signin successful', { 
        userId: data.user?.id,
        email: req.body.email?.substring(0, 3) + '***',
        role: req.params.role 
      });

      res.status(201).json({ success: true, data, message: reqT('login_success') });
    } catch (error) {
      logger.warn('User signin failed', { 
        email: req.body.email?.substring(0, 3) + '***',
        role: req.params.role,
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };


  public sendResetPasswordEmail = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Password reset email requested', { 
        email: req.body.email?.substring(0, 3) + '***',
        ip: req.ip 
      });

      const data = await this.authService.sendResetPasswordEmail({
        email: req.body.email,
        redirectUrl: `${req.get('origin')}${resetPasswordRedirectRoute}`
      });
      res.status(200).json({ success: true, data, message: reqT('reset_password_email_sent') });
    } catch (error) {
      logger.warn('Password reset email failed', { 
        email: req.body.email?.substring(0, 3) + '***',
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };


  public updatePassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Password update attempt', { 
        userId: req.user.profile?.id,
        ip: req.ip 
      });

      const data = await this.authService.updatePassword(req.user, req.body);
      
      logger.info('Password updated successfully', { userId: req.user.profile?.id });

      res.status(200).json({ success: true, data, message: reqT('password_changed_successfully') });
    } catch (error) {
      logger.warn('Password update failed', { 
        userId: req.user.profile?.id,
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

  public resetPassword = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Password reset attempt', { ip: req.ip });

      const data = await this.authService.resetPassword(req.body);
      
      logger.info('Password reset successful');

      res.status(200).json({ success: true, data, message: reqT('password_changed_successfully') });
    } catch (error) {
      logger.warn('Password reset failed', { 
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: IRefreshToken = req.body;

      logger.info('Token refresh requested', { ip: req.ip });

      const accessToken = await this.authService
        .refreshToken(data.token);

      logger.info('Token refreshed successfully');

      res.status(201).json({ success: true, data: { accessToken }, message: 'Access token generated' });
    } catch (error) {
      logger.warn('Token refresh failed', { 
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

  public deleteAccount = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('Account deletion requested', { 
        userId: req.user.profile?.id,
        ip: req.ip 
      });

      await this.authService.deleteAccount(req.user.profile.id);
      
      logger.info('Account deleted successfully', { userId: req.user.profile?.id });

      res.status(200).json({ success: true, message: reqT('deleted_successfully') });
    } catch (error) {
      logger.warn('Account deletion failed', { 
        userId: req.user.profile?.id,
        error: error.message,
        ip: req.ip 
      });
      next(error);
    }
  };

}

export default AuthController;
