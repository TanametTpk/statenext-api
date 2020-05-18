let environments = process.env
let allowedOrigins :(string|undefined)[] = Object.keys(environments).filter(env => env.match(/^ALLOW_ORIGIN\d*$/)).map((key) => environments[key])

if (allowedOrigins.length < 1) {
    allowedOrigins = ["http://localhost"]
}

export default allowedOrigins