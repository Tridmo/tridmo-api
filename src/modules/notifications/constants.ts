interface INotificationActions {
  readonly new_model_download: string;
  readonly new_model_upload: string;
  readonly new_interior_upload: string;
  readonly new__tag: string;
  readonly new_comment: string;
  readonly new_like: string;
  readonly new_message: string;
  readonly banned: string;
}

export const notificationActions: INotificationActions = {
  new_model_download: 'new_model_download',
  new_model_upload: 'new_model_upload',
  new_interior_upload: 'new_interior_upload',
  new__tag: 'new__tag',
  new_comment: 'new_comment',
  new_like: 'new_like',
  new_message: 'new_message',
  banned: 'banned',
}