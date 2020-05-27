import { State, Route, Responable, SocketConfig, SocketBoardcastType, Routable, instanceofRoute, SocketBoardcastPayload } from "./SystemManagement"
import socketIO, { Server as SocketServer, Socket } from 'socket.io'
import {Server as HttpServer} from 'http'
import _ from "lodash"

export default class SocketBuilder {

    private state!: State
    private server!: HttpServer
    private io!: SocketServer

    constructor(server: HttpServer, state: State) {
        this.server = server
        this.io = socketIO(this.server)
        this.state = state
    }

    private findService = (route: Route): Responable => {

        const { services } = this.state
        return services[route.controller][route.action]

    }

    private boardcast = (socket:Socket, conf: SocketConfig, data: any, receivers: string[]) => {

        const { boardcast } = conf

        if (!boardcast?.event_name) return
        const event_name: string = boardcast?.event_name

        let type: SocketBoardcastType | undefined

        if (boardcast) type = boardcast.type

        if (type === "boardcast"){
            socket.broadcast.emit(event_name, data)
        }

        if (type === "personal"){

            if (receivers) receivers.map((receiver) => {
                socket.to(receiver).emit(event_name, data)
            })

        }

    }

    private createController = (socket:Socket, config: SocketConfig, method: Function) => {

        const { event_name, boardcast } = config

        socket.on(event_name, async(data:any, callback:any) => {

            try {

                // socket = req
                socket.body = data

                // response
                let response = await method(socket)
                if (callback) callback(response)

                if (!socket._receivers) socket._receivers = []

                // boardcast
                this.boardcast(socket, config, response , socket._receivers)

                // custom boardcast
                if (socket._boardcasts){
                    socket._boardcasts.map((_boardcast: SocketBoardcastPayload) => {
                        // socket:Socket, conf: SocketConfig, data: any, receivers: string[]
                        let _boardcastConfig: SocketConfig = {
                            event_name: _boardcast.event_name,
                            boardcast: _boardcast
                        }

                        this.boardcast(socket, _boardcastConfig, _boardcast.data, _boardcast.receivers)
                    })
                }


            } catch (err) {
                if (callback) callback({error:err.message})
            }

        });

    }

    private setupMiddlewares = (io:SocketServer, socket:Socket) => {

        // socket have global middlewares only, except use namespace you can make sub middlewares
        // Object.values(middlewares).map((middleware) => {

        //     io.use(middleware)

        // })

    }

    private setupDefaultController = (socket:Socket) => {

        socket.on('join' , (data:any , callback:any) => {

            try{
                socket.join(data.room)
                callback({success:true})
            } catch (err) {
                callback({error:err.message})
            }
    
        })
    
        socket.on('leave' , (data:any, callback:any) => {
    
            try{
                socket.leave(data.room)
                callback({success:true})
            }catch(err){
                callback({error:err.message})
            }
    
        })

    }

    private createRoute = (routable: Routable, socket:Socket):void => {

        // if object is route then create controller
        // else recursive createRouter
        if (instanceofRoute(routable)) {

            let route: Route = routable
            
            // find service
            let method: Responable = this.findService(route)
            this.createMainController(route, socket, method)


        } else{

            let routeNames: string[] = Object.keys(routable)

            _.map<string>(routeNames, (name: string) => {

                let r: Routable = routable[name]
                this.createRoute(r, socket)

            })

        }

    }

    private createMainController = (route:Route, socket:Socket, service:Responable) => {

        // if have socket
        if (route.socket) {

            this.createController(
                socket,
                route.socket,
                service,
            )

        }

    }

    private setupController = (socket:Socket) => {

        const routesConfig = this.state.routes
        this.createRoute(routesConfig, socket)

    }

    public build = (): SocketServer => {

        // connected
        this.io.on('connection' , (socket:Socket) => {

            // setup middlewares
            this.setupMiddlewares(this.io, socket)

            // setup controller
            this.setupDefaultController(socket)
            this.setupController(socket)

            socket.on('disconnect' , () => {
                // disconnected
            })

        })

        return this.io

    }

}