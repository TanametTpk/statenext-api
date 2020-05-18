import { Router, Request, Response, NextFunction } from 'express'
import { State, RoutableMapping } from './SystemManagement'

export default class HttpBuilder {

    private state!: State

    constructor(state: State) {
        this.state = state
    }

    private createRouter = (routes: RoutableMapping):Router => {

        const router = Router()

        // object to array

        // if object is route then create controller
        // else recursive createRouter

        // set to router

        return router

    }

    private createController = (method: (req:Request) => any) => {

        const response = (req: Request, res: Response, data: any) => {

            if (req._responseAsHtml){
                res.send(data)
            }

            else {
                res.success(data)
            }

        }

        return async (req: Request, res: Response, next: NextFunction) => {

            try {
        
                response(req, res, await method(req))
        
            } catch (err){
                next(err)
            }
        
        };
        

    }

    public build = ():Router => {

        // do something

        return Router()

    }

}