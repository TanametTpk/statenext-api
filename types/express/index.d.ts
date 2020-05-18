declare namespace Express {

    interface Request {
        _responseAsHtml: boolean
    }

    interface Response {

        success: Function
        unauthorized: Function
        preconditionFailed: Function
        blocked: Function
        notFound: Function
        repeat: Function
        serverError: Function

    }

}

