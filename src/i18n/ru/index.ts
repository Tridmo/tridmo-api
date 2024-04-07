import type { Translation } from '../i18n-types'

const ru = {
	unauthorized: 'Не авторизованный доступ',
	login_to_access: 'Пожалуйста, войдите, чтобы получить доступ',
	user_404: 'Пользователь не найден',
	email_exist: 'Электронная почта уже зарегистрирована',
	email_invalid: 'Неверный адрес электронной почты',
	email_or_username_required: 'Необходимо указать адрес электронной почты или имя пользователя',
	signup_success_check_email: 'Регистрация прошла успешно. Пожалуйста, проверьте свою электронную почту для подтверждения',
	check_email_to_verify: 'Пожалуйста, проверьте свою электронную почту для подтверждения',
	login_success: 'Авторизация прошла успешна',
	signup_success: 'Регистрация прошла успешно',
	invalid_login_credentials: 'Неверные логин или пароль',

	saved_successfully: 'Успешно сохранено',
	deleted_successfully: 'Успешно удалено',
	sth_went_wrong: 'Что-то пошло не так. Пожалуйста, попробуйте еще раз',

	interior_404: 'Интерьер не найден',
	interior_created: 'Интерьер успешно создан',

	image_404: 'Изображение не найдено'
} satisfies Translation

export default ru
