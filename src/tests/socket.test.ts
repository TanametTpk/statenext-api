import { expect } from 'chai'
import ServerBuilder, { Router, SNRequest, SocketBoardcastPayload } from '../index'
import { Server } from 'http'
import io from 'socket.io-client'
import { System } from '../configs/express'

describe('Running Socket Server', () => {

    let server: Server
    let addressInfo: any
    let socket: SocketIOClient.Socket
    let ioServer: SocketIO.Server | undefined

    beforeAll(() => {

        let routes: Router = {
            index: {
                path: "/",
                method: "get",
                middlewares: [],
                controller: "tests",
                action: "get",
                socket:{
                    event_name: "get-xs",
                    boardcast: {
                        type: "boardcast",
                        event_name: "boardcast-default"
                    }
                }
            },
            personal: {
                path: "/",
                method: "get",
                middlewares: [],
                controller: "tests",
                action: "personal",
                socket:{
                    event_name: "pd",
                    boardcast: {
                        type: "personal",
                        event_name: "personal-default"
                    }
                }
            },
            custom: {
                boardcast:{
                    path: "/",
                    method: "get",
                    middlewares: [],
                    controller: "tests",
                    action: "customBoardcast",
                    socket:{
                        event_name: "cb",
                    }
                },
                personal: {
                    path: "/",
                    method: "get",
                    middlewares: [],
                    controller: "tests",
                    action: "customPersonal",
                    socket:{
                        event_name: "cp",
                    }
                }
            }
        }
        
        let services = {

            tests:{

                get: async (req: SNRequest) => {
        
                    return req.body;
                    
                },
                
                personal: async (req: SNRequest) => {
                    req._receivers = ["test-room"]
                    return req.body
                },

                customBoardcast: async (req: SNRequest) => {

                    let payload: SocketBoardcastPayload[] = [
                        {
                            type:"boardcast",
                            data: "cus-board",
                            receivers: [],
                            event_name:"re-cus-board"
                        }
                    ]

                    req._boardcasts = payload
                    return {}
                },

                customPersonal: async (req: SNRequest) => {

                    let payload: SocketBoardcastPayload[] = [
                        {
                            type:"personal",
                            data: "cus-per",
                            receivers: ["test-room"],
                            event_name:"re-cus-per"
                        }
                    ]

                    req._boardcasts = payload
                    return {}
                },

            }
        }

        let builder = new ServerBuilder()

        let system: System = builder.setup({
            routes,
            services,
        })

        server = system.server.listen()
        ioServer = system.socket

        addressInfo = server.address()

    })

    beforeEach((done) => {

        socket = io.connect(`http://[${addressInfo.address}]:${addressInfo.port}`, {
            reconnection: true,
            forceNew: true,
            transports: ['websocket'],
        });

        socket.on("connect", () => {
            done()
        })

    })

    afterEach((done) => {

        if (socket.connected) {
          socket.disconnect()
        }

        done()

    })

    afterAll((done) => {
        ioServer?.close()
        server.close()
        done()
    })

    describe('working ', () => {

        it('client to server', (done) => {
            
            let msg:string = "Hello"

            socket.emit("get-xs", msg, (data:any) => {

                expect(data).equal(msg)
                done()

            })

        })

        it('server to client', (done) => {

            let msg:string = "test"

            ioServer?.emit("receive", msg)

            socket.on("receive", (data: any) => {
                expect(data).equal(msg)
                done()
            })

        })

    })

    describe('broadcast ', () => {

        let desSocket: SocketIOClient.Socket

        beforeEach((done) => {

            desSocket = io.connect(`http://[${addressInfo.address}]:${addressInfo.port}`, {
                reconnection: true,
                forceNew: true,
                transports: ['websocket'],
            });
    
            desSocket.on("connect", () => {
                done()
            })

            desSocket.emit("join", {room:"test-room"}, () => {})
    
        })
    
        afterEach((done) => {
    
            if (desSocket.connected) {
                desSocket.emit("leave", {room:"test-room"}, () => {})
                desSocket.disconnect()
            }
    
            done()
    
        })

        it('default boardcast', (done) => {
            
            let msg:string = "b"

            socket.emit("get-xs", msg)

            desSocket.on("boardcast-default", (data: any) => {
                expect(data).equal(msg)
                done()
            })

        })

        it('default personal', (done) => {

            let msg:string = "p"

            socket?.emit("pd", msg)

            desSocket.on("personal-default", (data: any) => {
                expect(data).equal(msg)
                done()
            })

        })

        it('custom boardcast', (done) => {

            let msg:string = "cb"

            socket?.emit("cb", msg)

            desSocket.on("re-cus-board", (data: any) => {
                expect(data).equal("cus-board")
                done()
            })

        })

        it('custom personal', (done) => {

            let msg:string = "cp"

            socket?.emit("cp", msg)

            desSocket.on("re-cus-per", (data: any) => {
                expect(data).equal("cus-per")
                done()
            })

        })

    })

})