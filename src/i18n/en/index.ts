import type { BaseTranslation } from '../i18n-types'

const en = {
  unauthorized: 'Unauthorized',
  access_denied: 'Access denied',
  login_to_access: 'Please login in to get access',
  email_exist: 'Email was already registered',
  email_invalid: 'Invalid email',
  email_or_username_required: 'Email or username must be provided',
  signup_success_check_email: 'Signed up successfully. Please check your email for verification',
  check_email_to_verify: 'Please check your email for verification',
  login_success: 'Logged in successfully',
  signup_success: 'Signed up successfully',
  invalid_login_credentials: 'Invalid login credentials',
  you_are_banned: 'Account has been blocked',
  you_are_banned_until: 'Account is blocked until ',

  created_successfully: 'Created successfully',
  added_successfully: 'Added successfully',
  updated_successfully: 'Updated successfully',
  banned_successfully: 'Blocked successfully',
  saved_successfully: 'Saved successfully',
  deleted_successfully: 'Deleted successfully',
  sth_went_wrong: 'Something went wrong. Please, try again',

  interior_created: 'Interior created successfully',
  same_name_exists: 'Record with the same name already exists',
  model_in_project: 'This model was already added to project',

  not_found: 'Not found',
  user_404: "User was not found",
  interior_404: 'Interior was not found',
  interior_model_404: 'Tag was not found',
  image_404: 'Image was not found',
  file_404: 'File was not found',
  brand_404: 'Brand was not found',
  category_404: 'Category was not found',
  model_404: 'Model was not found',
  project_404: 'Project was not found',
} satisfies BaseTranslation

export default en
