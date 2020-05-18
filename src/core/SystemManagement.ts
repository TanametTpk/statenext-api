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
export type CallbackMapping = { [name:string]: Function }

export interface State {
    routes: {
        [name:string]: Routable
    },
    services: CallbackMapping
    errors: CallbackMapping
}

export interface AddingState {

    routes?: {
        [name:string]: Routable
    },
    services?: CallbackMapping
    errors?: CallbackMapping

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