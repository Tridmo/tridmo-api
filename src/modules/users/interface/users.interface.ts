export interface ICreateUser {
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  birth_date: Date;
}

export interface IUpdateUser {
  full_name?: string;
  language_id?: number;
  username?: string;
  birth_date?: Date;
}
export interface IUserMetadata {
  full_name: string;
  username: string;
  birth_date: Date;
}
export interface IUpdateUserEmail {
  email: string;
}
export interface IUpdateUserPassword {
  old_password: string;
  new_password: string;
}

export interface IUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  birth_date: Date;
  created_at: Date;
  updated_at: Date;
}
