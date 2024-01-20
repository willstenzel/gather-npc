import type { NextApiRequest, NextApiResponse } from "next"
import { Game, MapObject } from "@gathertown/gather-game-client"
import { DocumentReference } from "firebase-admin/firestore"

import { QUEST_INFO } from "@/lib/shared/consts"
import { createGameConnection } from "@/lib/shared/createGameConnection"
import { initFirebaseAdmin } from "@/lib/shared/initFirebaseAdmin"

const db = initFirebaseAdmin()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Functions
  const getFirestoreRooms = async (questName: string) => {
    const rooms = await db
      .collection("quests")
      .doc(questName)
      .collection("rooms")
      .listDocuments()

    return rooms
  }

  const resetFirestoreData = async (room: DocumentReference) => {
    await room.update({
      characterMessage: "",
      chatContext: {},
      chatFlowIndex: 0,
      chatInputText: "",
      inUnmodifiedState: true,
      isLastMessageInFlow: false,
      lastMessageSetAt: null,
      goToNextMessageOnReturn: false,
      submittedText: null,
      timerCompleteTime: null,
      timerMinutesToComplete: null,
    })
  }

  // Usages
  const questName = req.query.questName

  if (!questName || typeof questName !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Missing quest name in query params" })
  }

  const game = await createGameConnection(
    QUEST_INFO[questName as string].spaceId
  )

  // Kick all players from the space
  for (const playerId of Object.keys(game.players)) {
    console.log(`Kicking player ${playerId}`)
    game.kickPlayer(playerId)
  }

  // ---- Reset the firestore data ----
  const firestoreRooms = await getFirestoreRooms(questName as string)

  for (const firestoreRoom of firestoreRooms) {
    await resetFirestoreData(firestoreRoom)
  }

  await game.disconnect()
  return res.status(200).json({ success: true, message: "Space reset" })
}
