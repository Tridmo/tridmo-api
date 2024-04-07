import { NextFunction, Response } from 'express';
import { CustomRequest } from '../modules/shared/interface/routes.interface';
import L from '../i18n/i18n-node';

export const reqLangData: {
    lang: CustomRequest['lang'],
    t: CustomRequest['t']
} = {
    lang: 'en',
    t: L.en,
}

const requestLang = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const lang = req.headers['accept-language'].split('-')[0] || 'en'
    req.lang = reqLangData.lang = lang;
    req.t = reqLangData.t = L[lang]
    next()
}

export default requestLang;