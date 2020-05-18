import { Router, Request, Response, NextFunction } from 'express'
import { State, Routable, instanceofRoute, Route, Responable } from './SystemManagement'
import _ from 'lodash'

export type ExpressFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>

export default class HttpBuilder {

    private state!: State

    constructor(state: State) {
        this.state = state
    }

    private findService = (route: Route): Responable => {

        const { services } = this.state
        return services[route.controller][route.action]

    }

    private createRouter = (routable: Routable):Router => {

        const router = Router()

        // if object is route then create controller
        // else recursive createRouter
        if (instanceofRoute(routable)) {

            let route: Route = routable
            
            // find service
            let method: Responable = this.findService(route)
            let service:ExpressFunction = this.createController(method)

            // set to router
            router[route.method](`/${route.path}`, service)

        } else{

            let routeNames: string[] = Object.keys(routable)

            _.map<string>(routeNames, (name: string) => {

                let r: Routable = routable[name]
                let subRouter: Router = this.createRouter(r)
                
                // create as root path, if it's is index
                if (name === "index") {
                    name = ""
                }

                router.use(`/${name}`, subRouter)

            })

        }

        return router

    }

    private createController = (method: Responable): ExpressFunction => {

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

        let root: Routable = this.state.routes
        return this.createRouter(root)

    }

}