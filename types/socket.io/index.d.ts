
declare namespace SocketIO {

    interface Socket {
        body?: any
        _receivers?: string[]
        _boardcasts?: SocketBoardcastPayload[]
    }

    interface SocketBoardcastPayload {
        event_name: string,
        receivers: string[],
        type: SocketBoardcastType,
        data: any
    }

    type SocketBoardcastType = "personal" | "boardcast"

}

