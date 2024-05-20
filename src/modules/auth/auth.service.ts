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
import { generateFromEmail } from "unique-username-generator";
import { IRequestFile } from "../shared/interface/files.interface";
import { deleteFile, uploadFile } from "../shared/utils/fileUpload";
import { s3Vars } from "../../config/conf";
import { ChatUtils } from "../chat/utils";

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

  async signup({ email, full_name, password, birth_date, company_name }: ISignup) {

    const { data: { user, session }, error } = await supabase.auth.signUp({ email, password })

    if (!user?.identities?.length)
      throw new ErrorResponse(400, reqT('email_exist'));
    if (error)
      throw new ErrorResponse(error.status, error.message);

    const username = generateFromEmail(email, 6)

    const profile = await this.usersService.create({
      user_id: user.id, full_name, email, birth_date, company_name, username
    })

    await this.userRolesService.create({ user_id: profile.id, role_id: authVariables.roles.designer })

    return { otpEmail: email };
  }

  async syncToChat(user: IUser) {
    await this.chat.syncUser(user)
    await this.chat.addMember(user)
  }

  async createVerifiedUser({ email, full_name, password, birth_date, company_name, username }: ISignup, image?: IRequestFile) {

    const { data: { user }, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (!user?.identities?.length)
      throw new ErrorResponse(400, reqT('email_exist'));
    if (error)
      throw new Error(error.message);

    username = username || generateFromEmail(email, 6)

    let uploadedImage;
    if (image) uploadedImage = await uploadFile(image, "images/pfps", s3Vars.imagesBucket, username, /*fileDefaults.model_cover*/);

    const profile = await this.usersService.create({
      user_id: user.id, full_name, email, birth_date, username, company_name,
      image_src: uploadedImage ? uploadedImage[0].src : null
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

  async signIn({ email, username, password, role }: ISignin) {

    if (!(email || username)) throw new ErrorResponse(400, reqT('email_or_username_required'));

    const profile = email ? await this.usersService.getByEmail(email) : await this.usersService.getByUsername(username)

    if (!profile) throw new ErrorResponse(400, reqT('user_404'));

    if (role) {
      const roles = await this.rolesService.findByName(role)
      if (!roles) throw new ErrorResponse(404, 'Role was not found')
      const userRole = await this.userRolesService.getByUserAndRole({ user_id: profile.id, role_id: roles.id })
      if (!userRole) throw new ErrorResponse(404, reqT('user_404'))
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
          birth_date: session!.user.user_metadata.birth_date,
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
    await this.chat.deleteUser(user)
    await deleteFile(s3Vars.imagesBucket, user.image_src)
    await supabase.auth.admin.deleteUser(user.user_id)
  }


}