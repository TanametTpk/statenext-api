# What is statenext-api ? | statenext-api คืออะไร ?

This is package that help you create API server with typescript faster.
นี้คือ package ที่จะช่วยให้สร้าง API server ได้เร็วขึ้นด้วย typescript 

# What can statenext-api do ? | statenext-api ทำอะไรได้บ้าง​ ?
statenext-api is build on top of Express, I try to make developer write less code and more reuse.
statenext-api สร้างต่อยอดจาก Express, เราพยายามจะทำให้ developer เขียน code น้อยลง แต่ reuse ได้เยอะขึ้น

## features
- meta-data based | ใช้ meta-data เป็นหลัก
- one service all trasportation | สร้าง service เดียวใช้ได้ทุกรูปแบบ

# Installation

`npm i --save statenext-api`

then import

```
import Server, {SNRequest, Router, SocketBoardcastPayload} from 'statenext-api'

let routes:Router = {
    index: {
        path: "/",
        method: "get",
        middlewares: [],
        controller: "xs",
        action: "get",
        socket:{
            event_name: "get-xs",
        }
    },
    api: {
        hello: {
            path: "/",
            method: "get",
            middlewares: [],
            controller: "xs",
            action: "get",
        }
    }
}


let services = {
    xs:{
        get: async (req:SNRequest) => {

            req._receivers = [req.body.to]
            return ["hello world", req.body.message];
            
        }
    },

}

let server = new Server()

server.setup({
    // services,
}).server.listen(8080, () => {
    console.log("listen on 8080")
})

```

# Usages

use path create routes

### example project structure

- server.ts
- /routes
    - index.ts
    - /api
        - hello.ts
- /services
    - /xs
        - get.ts

### routes example
```
export default {
    path: "/",
    method: "get",
    middlewares: [],
    controller: "xs",
    action: "get",
    socket:{
        event_name: "get-xs",
        boardcast:{
            type: "personal",
            event_name: "new-xs"
        }
    }
}
```

### service example
```
import { SNRequest } from "statenext-api";

export default async (req:SNRequest) => {

    req._receivers = [req.body.to]
    return ["hello world", req.body.message];
            
}
```

### server example
```
import Server from 'statenext-api'

let server = new Server()

server.usePath(__dirname + '/routes', __dirname + '/services')

server.setup({
    // services,
}).server.listen(8080, () => {
    console.log("listen on 8080")
})

```

# CORS

you can allow cors by env like
คุณสามารถ allow cors ได้เพียงแค่ใช้ env

```
ALLOW_ORIGIN=http://localhost
```
or multiple origins
ถ้าจะใช้หลายๆอันก็ได้

```
ALLOW_ORIGIN=<domain1>
ALLOW_ORIGIN0=<domain2>
ALLOW_ORIGIN1=<domain3>
ALLOW_ORIGIN2=<domain4>
ALLOW_ORIGIN3=<domain5>
```
