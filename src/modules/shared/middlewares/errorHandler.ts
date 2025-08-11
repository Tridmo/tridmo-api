import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';
import { CustomRequest } from '../interface/routes.interface';
import { AxiosError } from 'axios';
import { isDevelopment } from '../utils/nodeEnv';
import logger from '../../../lib/logger';


const errorHandler = (error: ErrorResponse | AxiosError, req: CustomRequest, res: Response, next: NextFunction) => {

  const { reason, ...x } = error as ErrorResponse

  if (isDevelopment()) logger.error(error instanceof AxiosError ? error.response.data : error);

  const ErrorObject = {
    error: x,
    reason: reason || 'not_specified',
    message: error.message || req.t.sth_went_wrong(),
    success: false
  }

  res.status(error.status || 500).send(ErrorObject)
}

export default errorHandler