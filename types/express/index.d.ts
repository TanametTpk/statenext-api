declare namespace Express {

    interface Request {
        _responseAsHtml: boolean
        _receivers?: string[]
        _boardcasts?: SocketBoardcastPayload[]
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

    interface SocketBoardcastPayload {
        event_name: string,
        receivers: string[],
        type: SocketBoardcastType,
        data: any
    }

    type SocketBoardcastType = "personal" | "boardcast"

}

