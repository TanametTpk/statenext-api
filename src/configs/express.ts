import express, { Application } from "express"
import { Server as SocketServer } from 'socket.io'
import http, {Server} from 'http'
import SystemManagement, { State } from "../core/SystemManagement"
import HttpBuilder from '../core/HttpBuilder'
import SocketBuilder from '../core/SocketBuilder'
import customResponse from './middlewares/customResponse'
import _ from 'lodash'

export interface System {
    app: Application,
    socket?: SocketServer
    server: Server
}

export default class SystemBuilder {

    private app!: Application
    private server!: Server
    private system!: SystemManagement
    private socket?: SocketServer

    constructor(system: SystemManagement) {

        this.system = system

        this.app = express()
        this.server = http.createServer(this.app)

    }

    public buildErrorHandler = () => {

        const errors: Function[] = this.system.getErrors()
        _.map<Function>(errors, this.app.use)

    }

    public addGlobalMiddlewares = () => {

        // add global middlewares
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended: true}))
        this.app.use(customResponse)

    }

    public buildTransportation = () => {

        const state:State = this.system.getState()

        // create http transportaion
        let httpBuilder = new HttpBuilder(state)
        this.app.use(httpBuilder.build())

        // create socket transportaion
        let socketBuilder: SocketBuilder = new SocketBuilder(this.server, state)
        this.socket = socketBuilder.build()

    }

    public configuration = (): System => {

        this.addGlobalMiddlewares()
    
        this.buildTransportation()
    
        this.buildErrorHandler()
    
        return {
            app: this.app,
            server: this.server,
            socket: this.socket,
        }
    
    }

}
