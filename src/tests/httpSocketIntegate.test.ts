import { expect } from 'chai'
import ServerBuilder, { Router, SNRequest } from '../index'
import { Server } from 'http'
import { System } from '../configs/express'
import axios from 'axios'
import io from 'socket.io-client'

describe('Integation between http and socket', () => {

    let server: Server
    let addressInfo: any
    let socket: SocketIOClient.Socket

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
        }
        
        let services = {
            tests:{
                get: async (req: SNRequest) => {
        
                    return {msg:"hi"};
                    
                },
            }
        }

        let builder = new ServerBuilder()

        let system: System = builder.setup({
            routes,
            services,
        })

        server = system.server.listen()
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
        server.close()
        done()
    })

    describe('working', () => {

        it('http and emit socket', async (done) => {
            
            let url = `http://localhost:${addressInfo.port}/`
            await axios.get(url)

            socket.on("boardcast-default", (data: any) => {
                expect(data.msg).equal("hi")
                done()
            })

        })

    })

})