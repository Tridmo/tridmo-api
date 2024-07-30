export interface IUserBan {
  id: number;
  user_id: string;
  permanent: boolean;
  reason: string;
  until: Date;
  created_at: Date;
}
export interface ICreateUserBan {
  user_id: string;
  permanent: boolean;
  reason: string;
  until: Date;
}

export interface IUpdateUserBan {
  permanent?: boolean;
  reason?: string;
  until?: Date;
}
