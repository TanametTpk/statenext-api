import { expect } from 'chai'
import supertest, { SuperTest, Test } from 'supertest'
import ServerBuilder, { Router, SNRequest, middlewares } from '../index'
import { Server } from 'http'

describe('Including middlewares', () => {

    let request: SuperTest<Test>

    beforeAll(() => {

        let routes:Router = {
            tests:{
                path: "/",
                method: "get",
                middlewares: [middlewares.responseAsHtml],
                controller: "tests",
                action: "getHtml"
            }
        }
        
        let services = {
            tests:{
                getHtml: async (req:SNRequest) => {

                    return "<p>hello world</p>"

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

    describe('send html', () => {

        it('can reponse as html', (done) => {
            
            request
            .get('/tests')
            .expect('Content-Type', /html/)
            .expect(200)
            .then( res => {
                expect(res.text).to.equal("<p>hello world</p>")
                done()
            })
            .catch((err) => {
                done(err)
            })

        });

    });

})