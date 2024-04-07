import { LocalizedString } from 'typesafe-i18n/types/runtime/src/core.mjs'
import { reqLangData } from '../../../middleware/requestLang'
import { TranslationFunctions } from '../../../i18n/i18n-types';

export const reqLang = () => reqLangData.lang
export const reqT = (message: keyof TranslationFunctions): LocalizedString => reqLangData.t[message]();