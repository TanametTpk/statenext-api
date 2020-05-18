import { Request } from 'express'

export type Method = "get" | "post" | "put" | "delete" | "use"

export interface Router {
    [name:string]: Routable,
}

export interface Route {

    path: string,
    method: Method,
    middlewares: Function[],
    controller: string,
    action: string,
    priority?: number,
    routerId?: string,

}

export type Routable = Router | Route
export type Responable = (req: Request) => any
export type ServiceMapping = { [name:string]: { [method:string]: Responable } }
export type CallbackMapping = { [name:string]: Function }

export interface State {
    routes: Router
    services: ServiceMapping
    errors: CallbackMapping
}

export interface AddingState {

    routes?: Router
    services?: ServiceMapping
    errors?: CallbackMapping

}

export const instanceofRoute = (object: Routable): object is Route => {

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
            errors: {}
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