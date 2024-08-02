export interface IComment {
  id: string;
  entity_id: string;
  parent_id: string;
  entity_source: string;
  user_id: string;
  text: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateComment {
  text: string;
  entity_id: string;
  parent_id?: string;
  entity_source: string;
  user_id: string;
}


export interface ICreateCommentBody {
  text: string;
  entity_id: string;
  parent_id?: string;
  entity_source: string;
}

export interface IUpdateComment {
  text?: string;
}

export interface IFilterComment {
  id?: string;
  entity_id?: string;
  parent_id?: string;
  entity_source?: string;
  user_id?: string;
}

export interface ICommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: Date;
}

export interface ICreateCommentLike {
  comment_id: string,
  user_id: string,
}

export interface IFilterCommentLike {
  comment_id?: string,
  user_id?: string,
}