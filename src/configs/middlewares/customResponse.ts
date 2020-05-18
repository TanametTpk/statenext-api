import { Request, Response, NextFunction } from 'express';

const createCustomResponses = (res: Response) => ({

    success( payload:any ):any {
        return res.status( 200 ).json(payload);
    },

    unauthorized(payload:any ):any {
        return res.status( 401 ).json(payload);
    },

    preconditionFailed(payload:any ):any {
        return res.status( 412 ).json(payload);
    },

    blocked(payload:any ):any {
        return res.status( 403  ).json(payload);
    },

    notFound(payload:any ):any {
        return res.status( 404 ).json(payload);
    },

	repeat(payload:any ):any {
        return res.status( 409 ).json(payload);
    },

    serverError(payload:any ):any {
        return res.status( 503 ).json(payload);
    },

})

export default ( req:Request, res:Response, next:NextFunction ) => {
    Object.assign( res, createCustomResponses(res) );
    next();
}


