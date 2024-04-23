import { Router } from 'express';
import { Routes } from '../shared/interface/routes.interface';
import validate from '../shared/middlewares/validate';
import AuthController from './auth.controller';
import { ConfirmOtpDTO, ResendOtpDTO, SigninDTO, SignupDTO } from './dto/auth.dto';

export default class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, validate(SignupDTO, "body"), this.authController.signUp);
    this.router.post(`${this.path}signin/:role`, validate(SigninDTO, "body"), this.authController.signIn);
    this.router.get(`${this.path}verify`, (req, res) => { res.send('Confirm success') });
    this.router.post(`${this.path}resendcode`, validate(ResendOtpDTO, "body"), this.authController.resendOtp);
    this.router.post(`${this.path}refreshToken`, this.authController.refreshToken);
  }
}
