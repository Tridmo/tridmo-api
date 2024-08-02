import { isEmpty, isJSON } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import flat from 'flat'
import { processObject, processValue } from '../utils/processObject'

export class ParserMiddleware {

  public parseDeep = (
    target: 'body' | 'query' | 'params',
    {
      ignore = []
    }: {
      ignore?: string[]
    } = {}
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req[target] = processObject(flat.unflatten(req[target]), {
          ignoreValues: ignore
        })

        next()
      } catch (error) {
        next(error)
      }
    }
  }

  public parse = (
    target: 'body' | 'query' | 'params' = 'body',
    {
      ignore = []
    }: {
      ignore?: string[]
    } = {}
  ) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(req[target])
        for (const key in req[target]) {
          console.log(key);
          if (Object.prototype.hasOwnProperty.call(req[target], key) && !isEmpty(req[target][key])) {
            const element = req[target][key];
            req[target][key] = ignore.includes(key) ? element : processValue(element)
          }
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }

  public unflatten = (target: 'body' | 'query' | 'params') => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req[target] = flat.unflatten(req[target])
        next()
      } catch (error) {
        next(error)
      }
    }
  }

  public flatten = (target: 'body' | 'query' | 'params') => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req[target] = flat.flatten(req[target])
        next()
      } catch (error) {
        next(error)
      }
    }
  }

}