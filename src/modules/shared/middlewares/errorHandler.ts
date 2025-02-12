import { NextFunction, Request, Response } from 'express';
import ErrorResponse from '../utils/errorResponse';
import { CustomRequest } from '../interface/routes.interface';


const errorHandler = (error: ErrorResponse, req: CustomRequest, res: Response, next: NextFunction) => {

  const { reason, ...x } = error

  console.error(error);

  const ErrorObject = {
    error: x,
    reason: reason || 'not_specified',
    message: error.message || req.t.sth_went_wrong(),
    success: false
  }

  res.status(error.status || 500).send(ErrorObject)
}

export default errorHandler