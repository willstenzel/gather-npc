type TeleportCoordinates = {
  x: number
  y: number
}

type RoomInfo = {
  roomName: string
  gatherRoomId: string
  teleportCoordinates?: TeleportCoordinates
}

type QuestInfo = {
  [questKey: string]: {
    spaceId: string
    rooms: Array<RoomInfo>
  }
}

export const QUEST_INFO: QuestInfo = {
  "test-quest": {
    spaceId: process.env.GATHER_SPACE_ID!,
    rooms: [
      {
        roomName: "chapter-1",
        gatherRoomId: "blank",
      },
    ],
  },
}
