import { Request, Response, NextFunction } from 'express'

export default ( req:Request, res:Response, next:NextFunction ) => {
    req._responseAsHtml = true
    return next();
}
