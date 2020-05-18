import express, { Application } from "express"
import http, {Server} from 'http'
import SystemManagement, { State } from "../core/SystemManagement"
import HttpBuilder from '../core/HttpBuilder'
import customResponse from './middlewares/customResponse'
import _ from 'lodash'

export interface System {
    app: Application,
    server: Server
}

export default class SystemBuilder {

    private app!: Application
    private server!: Server
    private system!: SystemManagement

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

        // add logic here
        let httpBuilder = new HttpBuilder(state)
        this.app.use(httpBuilder.build())

    }

    public configuration = (): System => {

        this.addGlobalMiddlewares()
    
        this.buildTransportation()
    
        this.buildErrorHandler()
    
        return {
            app: this.app,
            server: this.server
        }
    
    }

}
