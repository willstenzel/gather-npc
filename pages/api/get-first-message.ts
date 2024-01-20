import type { NextApiRequest, NextApiResponse } from "next"

import { CHAT_FLOWS } from "@/lib/npc-chat/chat-flows"
import { initFirebaseAdmin } from "@/lib/shared/initFirebaseAdmin"

const db = initFirebaseAdmin()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const questName = req.body.globals.questName
  const roomId = req.body.globals.roomId

  const roomRef = db
    .collection("quests")
    .doc(questName)
    .collection("rooms")
    .doc(roomId)

  const nextStageInFlow = CHAT_FLOWS[questName][roomId].messages[0]

  const nextMessage = nextStageInFlow.getMessage({})
  const nextMessageWithLineBreaks = nextMessage.replace(/\n/g, "<br/>")

  const isLastMessageInFlow =
    CHAT_FLOWS[questName][roomId].messages.length === 1

  await roomRef.update({
    chatFlowIndex: 0,
    characterMessage: nextMessageWithLineBreaks,
    lastMessageSetAt: Date.now(),
    inUnmodifiedState: false,
    isLastMessageInFlow,
  })

  return res.status(200).json({ success: true, newStage: true })
}
