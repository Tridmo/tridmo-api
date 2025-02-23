import axios from "axios";
import { chatApi, s3Vars } from "../../../config";
import { IUser } from "../../users/users.interface";
import { IRequestFile } from "../../shared/interface/files.interface";
import ErrorResponse from "../../shared/utils/errorResponse";
import { authVariables } from "../../auth/variables";

export class ChatUtils {

  public async initApp({ uid, name, type, user_id }) {
    if (type !== "messenger") {
      const app = { uid: uid, name: name, type: type };
      const user = { uid: `${user_id}` };

      const response = await axios.post(`${chatApi.url}/api/apps/init`,
        { app: app, user: user },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${chatApi.key}`,
          }
        });

      if (![200, 201].includes(response?.status)) {
        throw new ErrorResponse(response?.status, `Error fetching app. Cause: ${response?.statusText}`);
      }

      return response?.data;
    }
  };

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

  public async registerWebhooks() {
    try {
      const getExisting = await axios.get(
        `${chatApi.url}/api/webhooks`,
        {
          headers: {
            'Authorization': `Bearer ${chatApi.key}`
          }
        }
      )

      if (!!getExisting?.data?.data?.length) {
        const hasPayload = getExisting?.data?.data?.find(w => w?.payload_url == chatApi.webhook_payload_url)
        if (hasPayload) {
          const res = await axios.patch(
            `${chatApi.url}/api/webhooks/${hasPayload?.id}`,
            {
              payload_url: chatApi.webhook_payload_url,
              secret: chatApi.webhook_secret,
              triggers: ['conversations']
            },
            {
              headers: { 'Authorization': `Bearer ${chatApi.key}` }
            }
          )
          console.log("WEBHOOK UPDATED: ", res?.data);
          return res?.data;
        }
      }

      const res = await axios.post(
        `${chatApi.url}/api/webhooks`,
        {
          payload_url: chatApi.webhook_payload_url,
          secret: chatApi.webhook_secret,
          triggers: [
            'conversations'
          ]
        },
        {
          headers: { 'Authorization': `Bearer ${chatApi.key}` }
        }
      )
      console.log("WEBHOOK CREATED: ", res?.data);
      return res?.data;
    } catch (error) {
      console.log("WEBHOOK ERROR: ", error);
    }
  }

  public async syncUser(user: IUser, role?, directory?) {

    try {
      const res = await axios.put(
        `${chatApi.url}/api/users/${user.id}`,
        {
          uid: user.id,
          name: user.full_name,
          email: user.email,
          nickname: user.username,
          picture: `${s3Vars.publicImagesEndpoint}/${user.image_src}`,
          directory: 'DEMOD',
          display_name: user.full_name,
          metadata: {
            company_name: user.company_name,
            display_name: user.full_name,
            role: role
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

  public async deleteUser(user_id: string) {
    try {
      const res = await axios.post(
        `${chatApi.url}/api/users/${user_id}/trash`, {},
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