import axios from "axios";
import { chatApi, s3Vars } from "../../../config/conf";
import { IUser } from "../../users/users.interface";
import { IRequestFile } from "../../shared/interface/files.interface";

const app = 'demod-chat'

export class ChatUtils {
  public async createChatApp() {
    try {
      const res = await axios.get(
        `${chatApi.url}/api/apps/${app}`,
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )

      if (res?.status == 200) res?.data;

    } catch (error) {
      if (error?.response?.status == 404) {
        const res = await axios.post(
          `${chatApi.url}/api/apps`,
          {
            uid: app,
            type: 'chat',
            access: 'none',
            directory: 'demod',

          },
          {
            headers: {
              'Authorization': `Bearer ${chatApi.key}`
            }
          }
        )
        console.info('Chat app created!');
        return res?.data;
      }
    }
  }

  public async getChatToken(user_id) {
    try {
      const res = await axios.post(
        `${chatApi.url}/api/users/${user_id}/tokens`,
        {
          expires_in: chatApi.expiresIn
        },
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )
      return res?.data?.access_token;
    } catch (error) {
      console.log(error);
    }
  }

  public async syncUser(user: IUser) {
    try {
      const res = await axios.put(
        `${chatApi.url}/api/users/${user.id}`,
        {
          uid: user.id,
          name: user.full_name,
          nickname: user.username,
          directory: 'demod',
          picture: `${s3Vars.publicImagesEndpoint}/${user.image_src}`,
          metadata: {
            company_name: user.company_name
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )
      return res?.data;
    } catch (error) {
      console.log(error);
    }
  }

  public async addMember(user: IUser) {
    try {
      const res = await axios.put(
        `${chatApi.url}/api/apps/${app}/users/${user.id}`,
        {
          app: app,
          user: user.id,
        },
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )
      return res?.data;
    } catch (error) {
      console.log(error);
    }
  }

  public async deleteUser(user: IUser) {
    try {
      const res = await axios.post(
        `${chatApi.url}/api/users/${user.id}/trash`,
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )
      return res?.data;
    } catch (error) {
      console.log(error);
    }
  }
}