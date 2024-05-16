import { IUserMetadata } from "../../users/users.interface";

interface IDecodedAccessToken {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string;
  app_metadata: {
    provider: string;
    providers: string[];
  },
  user_metadata: IUserMetadata,
  role: string;
  aal: string;
  amr: {
    method: string;
    timestamp: number;
  }[];
  session_id: string;
}