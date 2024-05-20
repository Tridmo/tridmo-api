export interface IChatToken {
  id: string;
  user_id: string;
  token: string;
  created_at: Date;
}

export interface ICreateChatToken {
  user_id: string;
  token: string;
  created_at?: Date;
}

export interface IFilterChatToken {
  id?: string;
  user_id?: string;
  token?: string;
}