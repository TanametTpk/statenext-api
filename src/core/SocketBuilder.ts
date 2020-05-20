import { State, Route, Responable, SocketConfig, SocketBoardcastType } from "./SystemManagement"
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

    public boardcast = (socket:Socket, conf: SocketConfig, data: any, receivers: string[]) => {

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

    public build = (server: HttpServer) => {

        const io:SocketServer = socketIO(server)


        const boardcast = (socket:Socket, conf: SocketConfig, data: any, receivers: string[]) => {

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

        const createMainController = (routeConfig:Route, socket:Socket) => {

            const routes = Object.values(routeConfig)
            routes.map((route:Route) => {

                const service = this.findService(route)

                // if have socket
                if (route.socket) {

                    let { event_name, boardcast } = route.socket
                    if (!boardcast) boardcast = {type:"", event_name:"none"}

                    createController(
                        socket,
                        event_name,
                        service,
                        boardcast.type,
                        boardcast.event_name
                    )

                }

            })

        }

        const createController = (socket:Socket, config: SocketConfig, method: Function) => {

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
                            this.boardcast(socket, _boardcast.type, _boardcast.event_name, _boardcast.data, _boardcast.receivers)
                        })
                    }


                } catch (err) {
                    callback({error:err.message})
                }

            });

        }

        const setupMiddlewares = (io, socket) => {

            // socket have global middlewares only, except use namespace you can make sub middlewares
            Object.values(middlewares).map((middleware) => {

                io.use(middleware)

            })

        }

        const setupController = (socket) => {

            const routesKey = Object.keys(routesConfig)
            routesKey.map((controllerName) => {
                
                let routeConf = routesConfig[controllerName]
                createMainController(routeConf, socket)

            })

        }

        const setupDefaultController = (socket) => {
            socket.on('join' , (data, callback) => {

                try{
                    socket.join(data.room)
                    callback({success:true})
                } catch (err) {
                    callback({error:err.message})
                }
        
            })
        
            socket.on('leave' , (data, callback) => {
        
                try{
                    socket.leave(data.room)
                    callback({success:true})
                }catch(err){
                    callback({error:err.message})
                }
        
            })
        }

        // connected
        io.on('connection' , function(socket){
            
            // setup middlewares
            setupMiddlewares(io, socket)

            // setup controller
            setupDefaultController(socket)
            setupController(socket)

            socket.on('disconnect' , function(){
                // disconnected
            })

        })

        return io

    }

}