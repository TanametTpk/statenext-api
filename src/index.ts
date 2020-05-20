import SystemManagement, { AddingState, SNRequest, SocketBoardcastPayload } from './core/SystemManagement'
import SystemBuilder, { System } from './configs/express'
import responseAsHtml from './configs/middlewares/responseAsHtml'
import requireAll from './helper/require-all'

export const middlewares =  {
    responseAsHtml
}

export { SNRequest, SocketBoardcastPayload }

export default class ServerBuilder {

    private systemManagement!: SystemManagement
    private systemBuilder!: SystemBuilder

    constructor() {

        this.systemManagement = new SystemManagement()
        this.systemBuilder = new SystemBuilder(this.systemManagement)

    }

    private addState(state: AddingState){

        this.systemManagement.addState(state)

    }

    public use(state: AddingState){

        this.addState(state)

    }

    public usePath(routePath: string, servicePath: string){

        let routes = requireAll(routePath)
        let services = requireAll(servicePath)

        this.use({routes, services})

    }

    public setup(state?: AddingState): System{

        if (state) this.use(state)

        // build server
        let system: System = this.systemBuilder.configuration()
        return system

    }

}