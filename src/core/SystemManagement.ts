import { Request } from 'express'

export type Method = "get" | "post" | "put" | "delete" | "use"
export type SocketBoardcastType = "personal" | "boardcast"

export interface Router {
    [name:string]: Routable
}

export interface SocketBoardcast {
    type: SocketBoardcastType
    event_name: string
}

export interface SocketConfig {
    event_name: string,
    boardcast?: SocketBoardcast
}

export interface Route {

    path: string
    method: Method
    middlewares: Function[]
    controller: string
    action: string
    priority?: number
    socket?: SocketConfig

}

export type RouteList = Route[]

export type Routable = Router | Route | RouteList
export type Responable = (req: Request) => any
export type ServiceMapping = { [name:string]: { [method:string]: Responable } }
export type CallbackMapping = { [name:string]: Function }

export interface SystemConfig {
    allow_origins: string[]
}

export interface State {
    routes: Router
    services: ServiceMapping
    errors: CallbackMapping
    configs: SystemConfig
}

export interface AddingState {

    routes?: Router
    services?: ServiceMapping
    errors?: CallbackMapping
    configs?: SystemConfig

}

export interface SocketBoardcastPayload {
    event_name: string,
    receivers: string[],
    type: SocketBoardcastType,
    data: any
}

interface SocketBoardcastExtend {
    body?: any
    _receivers?: string[]
    _boardcasts?: SocketBoardcastPayload[]
}

export type SNRequest =  SocketBoardcastExtend & Request

export const instanceofRouteList = (object: Routable): object is RouteList => {

    if (object instanceof Array) return true
    return false

}

export const instanceofRoute = (object: Routable): object is Route => {

    if (object instanceof Array) return false

    let checks: string[] = ['path','method', 'middlewares', 'controller', 'action']

    for (let i = 0; i < checks.length ; i++){

        if ( !(checks[i] in object) ) return false

    }

    return true
}

export default class SystemManagement {

    private state!: State

    constructor(state?:AddingState){

        this.state = {
            routes: {},
            services: {},
            errors: {},
            configs: {
                allow_origins: []
            },
        }

        if (state) this.addState(state)

    }

    public addState(state:AddingState){

        this.state = {
            ...this.state,
            ...state
        }

    }

    public getState():State {
        return this.state
    }

    public getErrors(): Function[] {
        return Object.values(this.state.errors)
    }

}