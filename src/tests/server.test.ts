import { expect } from 'chai'
import supertest, { SuperTest, Test } from 'supertest'
import ServerBuilder, { Router, SNRequest } from '../index'
import { Server } from 'http'
import 'mocha'

describe('Running server', () => {

    let request: SuperTest<Test>

    beforeAll(() => {

        let routes: Router = {
            tests:{
                path: "/",
                method: "get",
                middlewares: [],
                controller: "tests",
                action: "get"
            }
        }
        
        let services = {
            tests:{
                get: async (req: SNRequest) => {
        
                    return ["hello world"];
                    
                }
            }
        }

        let builder = new ServerBuilder()

        let server: Server = builder.setup({
            routes,
            services,
        }).server

        request = supertest(server)

    })

    describe('working', () => {

        it('can normally request', (done) => {
            
            request
            .get('/tests')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.length).to.equal(1)
                done()
            })
            .catch((err) => {
                done(err)
            })

        });

    });

})