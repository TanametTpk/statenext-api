import SystemManagement, { AddingState } from './core/SystemManagement'
import SystemBuilder, { System } from './configs/express'

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

    public setup(state?: AddingState): System{

        if (state) this.use(state)

        // build server
        let system: System = this.systemBuilder.configuration()
        return system

    }

}