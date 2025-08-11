import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';
import { CustomRequest } from '../interface/routes.interface';
import { AxiosError } from 'axios';
import { isDevelopment } from '../utils/nodeEnv';
import logger from '../../../lib/logger';


const errorHandler = (error: ErrorResponse | AxiosError | Error, req: CustomRequest, res: Response, next: NextFunction) => {

  const { reason, ...x } = error as ErrorResponse

  // Enhanced error logging with more context
  const errorContext = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.profile?.id,
    body: isDevelopment() ? JSON.stringify(req.body).substring(0, 500) : undefined
  };

  if (error instanceof AxiosError) {
    logger.error('External API error occurred', {
      ...errorContext,
      error: {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      },
      url: error.config?.url,
      method: error.config?.method
    });
  } else if (error instanceof ErrorResponse) {
    // Log custom application errors
    const logLevel = error.status >= 500 ? 'error' : 'warn';
    logger[logLevel]('Application error occurred', {
      ...errorContext,
      error: {
        message: error.message,
        status: error.status,
        reason: error.reason
      }
    });
  } else {
    // Log unexpected errors
    logger.error('Unexpected error occurred', {
      ...errorContext,
      error: {
        message: error.message,
        stack: isDevelopment() ? error.stack : undefined
      }
    });
  }

  // Log to console in development (keeping existing behavior)
  if (isDevelopment()) {
    logger.error('Development error details', error instanceof AxiosError ? error.response?.data : error);
  }

  const ErrorObject = {
    error: x,
    reason: reason || 'not_specified',
    message: error.message || req.t.sth_went_wrong(),
    success: false
  }

  res.status((error as ErrorResponse).status || 500).send(ErrorObject)
}

export default errorHandler