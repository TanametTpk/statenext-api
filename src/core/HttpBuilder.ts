import { Router, Request, Response, NextFunction } from 'express'
import { State, Routable, instanceofRoute, Route, Responable, SocketConfig, instanceofRouteList, RouteList } from './SystemManagement'
import { Server as SocketServer } from 'socket.io'
import _ from 'lodash'

export type ExpressFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>

type PostMethod = (req: Request, data: any) => Promise<void>

interface SocketIntegrate {

    boardcast(conf: SocketConfig, data: any, receivers: string[]): void

}

class HttpSocketNull implements SocketIntegrate {

    constructor(io?:SocketServer){}
    public boardcast(conf: SocketConfig, data: any, receivers: string[]): void {}

}

class HttpSocket implements SocketIntegrate {

    private io!: SocketServer

    constructor(io:SocketServer){
        this.io = io
    }

    public boardcast(conf: SocketConfig, data: any, receivers: string[]): void {

        if (!conf.boardcast) return

        if (conf.boardcast?.type === "personal"){
            this.msgToRoom(receivers, conf.boardcast.event_name, data)
        }

        else {
            this.msgToEveryone(conf.boardcast.event_name, data)
        }

    }

    private msgToRoom(receivers: string[], event_name:string, data:any){
        
        for (let i = 0; i < receivers.length; i++) {
            
            this.io.to(receivers[i]).emit(event_name, data)
            
        }

    }

    private msgToEveryone(event_name:string, data:any){

        this.io.emit(event_name, data)

    }

}

export default class HttpBuilder {

    private state!: State
    private socketIntegrater!: SocketIntegrate

    constructor(state: State, io?: SocketServer) {
        this.state = state
        
        if (io) this.socketIntegrater = new HttpSocket(io)
        else    this.socketIntegrater = new HttpSocketNull(io)

    }

    private findService = (route: Route): Responable => {

        const { services } = this.state
        return services[route.controller][route.action]

    }

    private createRouter = (routable: Routable):Router => {

        const router = Router()

        // if object is route then create controller
        // else recursive createRouter
        if (instanceofRoute(routable) || instanceofRouteList(routable)) {

            let routables:RouteList = []
            if (instanceofRoute(routable)) routables = [routable]
            if (instanceofRouteList(routable))


            for (let i = 0; i < routables.length; i++) {
                let route: Route = routables[i]
            
                // find service
                let method: Responable = this.findService(route)
                let postMethods: PostMethod[] = []

                postMethods.push(this.createBoardcastFunction(route))

                let service:ExpressFunction = this.createController(method, postMethods)

                // add middlewares
                _.map<Function>(route.middlewares, (middleware: ExpressFunction) => router.use(`/${route.path}`, middleware))

                // set to router
                router[route.method](`/${route.path}`, service)
            }

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

    private createController = (method: Responable, postMethods: PostMethod[]): ExpressFunction => {

        const response = (req: Request, res: Response, data: any) => {

            if (req._responseAsHtml){
                res.send(data)
            }

            else {
                res.success(data)
            }

            // run all post-method
            for (let i = 0; i < postMethods.length; i++) {
                const postMethod = postMethods[i]
                postMethod(req, data)
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

    private createBoardcastFunction = (route: Route):PostMethod => {

        return async (req, data: any) => {

            // default boardcast
            if (route.socket){

                this.socketIntegrater.boardcast(route.socket, data, req._receivers || [])

            }

            // custom boardcast
            if (req._boardcasts) {

                for (let i = 0; i < req._boardcasts.length; i++) {
                    const _boardcast = req._boardcasts[i]

                    this.socketIntegrater.boardcast(_boardcast, _boardcast.data, _boardcast.receivers)
                    
                }

            }

        }
    }

    public build = ():Router => {

        let root: Routable = this.state.routes
        return this.createRouter(root)

    }

}