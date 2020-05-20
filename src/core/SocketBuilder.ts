import { State, Route, Responable, SocketConfig, SocketBoardcastType, Routable } from "./SystemManagement"
import socketIO, { Server as SocketServer, Socket } from 'socket.io'
import {Server as HttpServer} from 'http'
import _ from "lodash"

export interface SocketBoardcastPayload {
    event_name: string,
    receivers: string[],
    type: SocketBoardcastType,
    data: any
}

export default class SocketBuilder {

    private state!: State

    constructor(state: State) {
        this.state = state
    }

    private findService = (route: Route): Responable => {

        const { services } = this.state
        return services[route.controller][route.action]

    }

    private boardcast = (socket:Socket, conf: SocketConfig, data: any, receivers: string[]) => {

        const { event_name, boardcast } = conf
        let type = ""

        if (boardcast) type = boardcast.type

        if (type === "boardcast"){
            socket.broadcast.emit(event_name, data);
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
                callback(response)

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
                callback({error:err.message})
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

    private createMainController = (routeConfig:Routable, socket:Socket) => {

        const routes = Object.values(routeConfig)
        routes.map((route:Route) => {

            const service = this.findService(route)

            // if have socket
            if (route.socket) {

                this.createController(
                    socket,
                    route.socket,
                    service,
                )

            }

        })

    }

    private setupController = (socket:Socket) => {

        const routesConfig = this.state.routes
        const routesKey = Object.keys(routesConfig)
        routesKey.map((controllerName: string) => {
            
            let routeConf:Routable = routesConfig[controllerName]
            this.createMainController(routeConf, socket)

        })

    }

    public build = (server: HttpServer) => {

        const io:SocketServer = socketIO(server)

        // connected
        io.on('connection' , (socket:Socket) => {
            
            // setup middlewares
            this.setupMiddlewares(io, socket)

            // setup controller
            this.setupDefaultController(socket)
            this.setupController(socket)

            socket.on('disconnect' , () => {
                // disconnected
            })

        })

        return io

    }

}