import { Router } from 'express'
import { State } from './SystemManagement'

export default class HttpBuilder {

    private state!: State

    constructor(state: State) {
        this.state = state
    }

    public build():Router {

        // do something

        return Router()

    }

}