import { isEmpty, isUndefined } from "lodash";
import ErrorResponse from "../shared/utils/errorResponse";

import { IUser } from "../users/users.interface";

import UsersService from "../users/users.service";
import LanguagesService from "../shared/modules/languages/languages.service";

import OtpsDAO from "./dao/otps.dao";
import SessionsDAO from "./dao/sessions.dao";

import { ISignin, ISignup, ITokenPayload } from "./interface/auth.interface";
import TokenService from "./providers/token.service";
import { IUserSession } from "./interface/sessions.interface";
import UserRoleService from "../users/user_roles/user_roles.service";
import supabase from "../../database/supabase/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { authVariables } from "./variables";
import { reqT } from '../shared/utils/language';
import RoleService from "../roles/roles.service";
import generateSlug from "../shared/utils/generateSlug";
import { generateFromEmail, generateUsername } from "unique-username-generator";
import { IRequestFile } from "../shared/interface/files.interface";
import { deleteFile, uploadFile } from "../shared/utils/fileUpload";
import { s3Vars } from "../../config";
import { ChatUtils } from "../chat/utils";
import slugify from "slugify";
import { generateUsernameFromName } from "../shared/utils/generateUsername";
import BrandService from "../brands/brands.service";
import UserBanService from "../users/user_bans/user_bans.service";
import { IBrand } from "../brands/brands.interface";
import { ResetPasswordDTO, UpdatePasswordDTO } from "./auth.dto";
import { IReqUser } from "../shared/interface/routes.interface";
import logger from "../../lib/logger";


export default class AuthService {
  private OtpDigitsCount = 6;

  private usersService = new UsersService();
  private languagesService = new LanguagesService();
  private userRolesService = new UserRoleService();
  private rolesService = new RoleService();
  private chat = new ChatUtils();

  private otpsDao = new OtpsDAO();
  private sessionsDao = new SessionsDAO();

  private jwtService = new TokenService()

  private buildSessionData({ user, session }) {
    return {
      user: {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata.full_name,
        is_verified: Boolean(user.confirmed_at),
        createdAt: user.created_at,
        updatedAt: user.updated_at!,
      },
      token: {
        refreshToken: session.refresh_token,
        accessToken: session.access_token,
        expiresIn: session.expires_in,
        tokenType: session.token_type
      }
    }
  }

  async signup({ email, full_name, password, company_name }: ISignup) {

    const { data: { user, session }, error } = await supabase.auth.signUp({ email, password })

    if (!user?.identities?.length)
      throw new ErrorResponse(400, reqT('email_exist'));
    if (error)
      throw new ErrorResponse(error.status, error.message);

    const username = generateUsernameFromName(full_name)

    const profile = await this.usersService.create({
      user_id: user.id, full_name, email, company_name, username
    })

    const role = await this.userRolesService.create({ user_id: profile.id, role_id: authVariables.roles.designer })

    if (session && user) {
      await this.chat.syncUser(profile, role?.role_id || authVariables.roles.designer)

      return {
        user: {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata.full_name,
          is_verified: !!user.email_confirmed_at || user.role == 'authenticated' || !!user.last_sign_in_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at!,
        },
        token: {
          refreshToken: session.refresh_token,
          accessToken: session.access_token,
          expiresIn: session.expires_in,
          tokenType: session.token_type
        }
      }
    } else {
      throw new ErrorResponse(500, reqT('sth_went_wrong'))
    }

    // return { otpEmail: email };
  }

  async syncToChat(user: IUser) {
    const role = await this.userRolesService.getByUserId(user.id)
    await this.chat.syncUser(user, role[0].role_id)
  }

  async createVerifiedUser(
    { email, full_name, password, company_name, username, image_src },
    image?: IRequestFile,
    brand?: IBrand
  ) {

    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password: `${password}`,
      email_confirm: true
    })

    if (error) {
      if (brand) await new BrandService().delete(brand?.id)
      throw new Error(error.message);
    }
    if (!user?.identities?.length) {
      if (brand) await new BrandService().delete(brand?.id)
      throw new ErrorResponse(400, reqT('email_exist'));
    }

    username = username || generateUsernameFromName(full_name)

    let uploadedImage;
    if (image) uploadedImage = await uploadFile({
      files: image, folder: "images/pfps", bucketName: s3Vars.imagesBucket, fileName: username
    });

    const user_image = uploadedImage ? uploadedImage[0].src : image_src ? image_src : null

    const profile = await this.usersService.create({
      user_id: user.id, full_name, email, username, company_name,
      image_src: user_image
    })
    await this.userRolesService.create({ user_id: profile.id, role_id: authVariables.roles.brand })

    return profile;
  }

  async resendOtp(email: string) {

    const user = await this.usersService.getByEmail(email)

    if (!user) {
      throw new ErrorResponse(400, reqT('email_invalid'));
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    })

    return data
  }

  async sendResetPasswordEmail({ email, redirectUrl }: { email: string, redirectUrl: string }) {

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    })

    if (error) {
      logger.error(error)
      throw new ErrorResponse(error.status, error.message);
    }

    return data
  }

  async updatePassword(user: IReqUser, { newPassword }: UpdatePasswordDTO) {

    const { data: { user: updatedUser }, error } = await supabase.auth.admin.updateUserById(user.profile.user_id, {
      password: newPassword
    })
    if (error) {
      logger.error(error)
      throw new ErrorResponse(error.status, error.message);
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: updatedUser.email,
      password: newPassword
    });

    if (signInError) {
      logger.error(signInError)
      throw new ErrorResponse(signInError.status, signInError.message);
    }

    return this.buildSessionData(signInData);
  }

  async resetPassword({ newPassword, token }: ResetPasswordDTO) {

    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError) {
      logger.error(getUserError)
      throw new ErrorResponse(getUserError.status, getUserError.message);
    }

    const { data: updatedUser, error: updateUserError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (updateUserError) {
      logger.error(updateUserError)
      throw new ErrorResponse(updateUserError.status, updateUserError.message);
    }

    return updatedUser
  }

  async signIn({ email, username, password, role_name, company }: ISignin) {

    if (!(email || username)) throw new ErrorResponse(400, reqT('email_or_username_required'));
    const profile = email ? await this.usersService.getByEmail_min(email) : await this.usersService.getByUsername_min(username)

    if (!profile) throw new ErrorResponse(400, reqT('user_404'));

    const bans = await new UserBanService().getByUserId(profile.id)

    if (bans.length) {
      bans.forEach(ban => {
        if (ban.permanent == true) throw new ErrorResponse(403, reqT('you_are_banned'), 'banned')
      })
    }

    const roles = await this.rolesService.findByName(role_name)
    if (!roles) throw new ErrorResponse(404, 'Role was not found')
    const role = await this.userRolesService.getByUserAndRole({ user_id: profile.id, role_id: roles.id })
    if (!role) throw new ErrorResponse(404, reqT('user_404'))

    if (role.id == authVariables.roles.admin) {
      if (!company || company?.toLowerCase() != profile.company_name?.toLowerCase()) throw new ErrorResponse(400, reqT('user_404')); throw new ErrorResponse(400, reqT('user_404'));
    }

    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password
    })

    if (error) {
      let message = reqT('sth_went_wrong')
      if (error.status == 400 && error.message == 'Invalid login credentials') {
        message = reqT('invalid_login_credentials')
      }
      if (error.status == 404) {
        message = reqT('user_404')
      }
      throw new ErrorResponse(error.status, message)
    };

    if (session && user) {
      await this.chat.syncUser(profile, role?.role_id || authVariables.roles.designer)

      return this.buildSessionData({ user, session });
    } else {
      throw new ErrorResponse(500, reqT('sth_went_wrong'))
    }
  }

  async authEvent(event: AuthChangeEvent, session: Session | null
  ): Promise<void> {
    if (event == 'SIGNED_IN') {
      await this.usersService.create(
        {
          user_id: session!.user.id,
          email: session!.user.email!,
          full_name: session!.user.user_metadata.full_name,
          company_name: session!.user.user_metadata.full_name,
          username: session!.user.user_metadata.username,
        }
      )
    }
  }

  async refreshToken(refreshToken: string) {
    const tokenInfo: IUserSession = await this.sessionsDao.getByRefreshToken(refreshToken)

    if (isUndefined(tokenInfo)) {
      throw new ErrorResponse(400, "Refresh token is not valid")
    }

    const accessTokenPayload: ITokenPayload = { user_id: tokenInfo.user_id }

    const accessToken = this.jwtService.getAccessToken(accessTokenPayload)

    return accessToken

  }

  async deleteAccount(user_id: string) {
    const user = await this.usersService.getById(user_id)
    if (!user) throw new ErrorResponse(404, reqT('user_404'))
    await this.chat.deleteUser(user.id)
    await deleteFile(s3Vars.imagesBucket, user.image_src)
    await supabase.auth.admin.deleteUser(user.user_id)
  }


}