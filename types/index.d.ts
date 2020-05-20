type SocketBoardcastType = "personal" | "boardcast"

interface SocketBoardcastPayload {
    event_name: string,
    receivers: string[],
    type: SocketBoardcastType,
    data: any
}