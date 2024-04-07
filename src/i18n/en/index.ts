import type { BaseTranslation } from '../i18n-types'

const en = {
	unauthorized: 'Unauthorized',
	login_to_access: 'Please login in to get access',
	user_404: "User was not found",
	email_exist: 'Email was already registered',
	email_invalid: 'Invalid email',
	email_or_username_required: 'Email or username must be provided',
	signup_success_check_email: 'Signed up successfully. Please check your email for verification',
	check_email_to_verify: 'Please check your email for verification',
	login_success: 'Logged in successfully',
	signup_success: 'Signed up successfully',
	invalid_login_credentials: 'Invalid login credentials',

	saved_successfully: 'Saved successfully',
	deleted_successfully: 'Deleted successfully',
	sth_went_wrong: 'Something went wrong. Please, try again',

	interior_404: 'Interior was not found',
	interior_created: 'Interior created successfully',

	image_404: 'Image was not found',
} satisfies BaseTranslation

export default en
