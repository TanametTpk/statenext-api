import { expect } from 'chai'
import supertest, { SuperTest, Test } from 'supertest'
import ServerBuilder, { Router, SNRequest } from '../index'
import { Server } from 'http'

describe('Running Http Server', () => {

    let request: SuperTest<Test>

    beforeAll(() => {

        let routes: Router = {
            tests:{
                path: "/",
                method: "get",
                middlewares: [],
                controller: "tests",
                action: "get"
            },
            index: {
                path: "/",
                method: "get",
                middlewares: [],
                controller: "tests",
                action: "home"
            },
            inner: {
                index: {
                    path: "/",
                    method: "get",
                    middlewares: [],
                    controller: "tests",
                    action: "inner"
                },
                var: {
                    path: "/",
                    method: "get",
                    middlewares: [],
                    controller: "tests",
                    action: "var"
                }
            },
            methods: {
                path: "/",
                method: "post",
                middlewares: [],
                controller: "tests",
                action: "post"
            },
            services: {
                path: "/",
                method: "get",
                middlewares: [],
                controller: "gg",
                action: "wp"
            }
        }
        
        let services = {
            tests:{
                get: async (req: SNRequest) => {
        
                    return ["hello world"];
                    
                },
                home: async (req: SNRequest) => {
                    return {msg:"home"}
                },
                inner: async (req: SNRequest) => {
                    return {msg:"inner"}
                },
                var: async (req: SNRequest) => {
                    return {msg:"var"}
                },
                post: async (req: SNRequest) => {
                    return {msg:"post"}
                },
            },
            gg:{
                wp: async (req: SNRequest) => {
                    return {msg:"wp"}
                },
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

        })

    })

    describe('routing', () => {

        it('index route', (done) => {
            
            request
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("home")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('index route', (done) => {
            
            request
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("home")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('inner index route', (done) => {
            
            request
            .get('/inner')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("inner")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })
        
        it('inner variable route', (done) => {
            
            request
            .get('/inner/var')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("var")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

        it('post method', (done) => {
            
            request
            .post('/methods')
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

        it('multiple service', (done) => {
            
            request
            .get('/services')
            .expect('Content-Type', /json/)
            .expect(200)
            .then( res => {
                expect(res.body.msg).to.equal("wp")
                done()
            })
            .catch((err) => {
                done(err)
            })

        })

    })

})