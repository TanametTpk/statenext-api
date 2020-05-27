import { expect } from 'chai'
import supertest, { SuperTest, Test } from 'supertest'
import ServerBuilder, { Router, SNRequest } from '../index'
import { Server } from 'http'

describe('Running Http Server', () => {

    let request: SuperTest<Test>

    beforeAll(() => {

        let routes: Router = {
            index: [
                {
                    path: "/",
                    method: "get",
                    middlewares: [],
                    controller: "tests",
                    action: "get"
                },
                {
                    path: "/",
                    method: "post",
                    middlewares: [],
                    controller: "tests",
                    action: "post"
                },
                {
                    path: "/",
                    method: "put",
                    middlewares: [],
                    controller: "tests",
                    action: "put"
                },
                {
                    path: "/",
                    method: "delete",
                    middlewares: [],
                    controller: "tests",
                    action: "delete"
                }
            ]
        }
        
        let services = {
            tests:{
                get: async (req: SNRequest) => {
                    return {msg:"get"};
                },
                post: async (req: SNRequest) => {
                    return {msg:"post"}
                },
                put: async (req: SNRequest) => {
                    return {msg:"put"}
                },
                delete: async (req: SNRequest) => {
                    return {msg:"delete"}
                }
            },
        }

        let builder = new ServerBuilder()

        let server: Server = builder.setup({
            routes,
            services,
        }).server

        request = supertest(server)

    })

    describe('multiple method in one path', () => {

        it('get method', (done) => {
            
            request
            .get('/tests')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.length).to.equal("get")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('post method', (done) => {
            
            request
            .post('/tests')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("post")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('put method', (done) => {
            
            request
            .put('/tests')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("put")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('delete method', (done) => {
            
            request
            .delete('/tests')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("delete")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

    })

})