import type { NextApiRequest, NextApiResponse } from "next"

import { CHAT_FLOWS } from "@/lib/npc-chat/chat-flows"
import { initFirebaseAdmin } from "@/lib/shared/initFirebaseAdmin"

const db = initFirebaseAdmin()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const submittedText = req.body.submittedText

  const questName = req.body.globals.questName
  const roomId = req.body.globals.roomId

  const questRef = db.collection("quests").doc(questName)
  const roomRef = questRef.collection("rooms").doc(roomId)

  const roomSnapshot = await roomRef.get()
  const roomData = roomSnapshot.data()

  // @ts-ignore
  const { chatFlowIndex, chatContext, lastMessageSetAt } = roomData

  // If the last message was set less than 2 seconds ago, don't do anything
  if (lastMessageSetAt && Date.now() - lastMessageSetAt < 2000) {
    return res.status(200).json({ success: true, newStage: false })
  }

  // Get next stage in the chat flow
  const nextStageInFlow =
    CHAT_FLOWS[questName][roomId].messages[chatFlowIndex + 1]

  if (!nextStageInFlow) {
    return res.status(200).json({ success: true, newStage: false })
  }

  // Set it in the loading state while we wait for the next message
  // and save the time to later check an edge case where multiple
  // requests come in concurrently
  const updateTime = Date.now()
  await roomRef.update({
    characterMessage: "",
    lastMessageSetAt: updateTime,
    timerMinutesToComplete: null,
    timerCompleteTime: null,
  })

  // ---- Handle updating context ----
  let updatedChatContext = structuredClone(chatContext)

  if (nextStageInFlow.addContextFromPreviousResponse) {
    const responseContext =
      await nextStageInFlow.addContextFromPreviousResponse(submittedText)

    // Escaping the HTML from the response context to prevent XSS
    const safeContext = Object.keys(responseContext).reduce<
      Record<string, any>
    >(
      (acc, key) => {
        const value = responseContext[key]

        if (typeof value === "string") {
          acc[key] = escapeHtml(value)
        } else {
          acc[key] = value
        }

        return acc
      },
      {} as Record<string, any> // Initial value for the accumulator
    )

    updatedChatContext = { ...updatedChatContext, ...safeContext }
  }

  // ---- Handle updating timer ----
  let updatedTimerData = {}

  if (nextStageInFlow.minutesToComplete) {
    const minutesToComplete = nextStageInFlow.minutesToComplete()

    // Add the minutesToComplete time to the context
    updatedChatContext = {
      ...updatedChatContext,
      minutesToComplete,
    }

    // Calculate the completion time
    const completionTime = Date.now() + minutesToComplete * 60 * 1000

    updatedTimerData = {
      timerMinutesToComplete: minutesToComplete,
      timerCompleteTime: completionTime,
    }
  } else {
    updatedTimerData = {
      timerMinutesToComplete: null,
      timerCompleteTime: null,
    }
  }

  // ---- Handle transition to next message ----
  let goToNextMessageOnReturn = false

  if (nextStageInFlow.goToNextMessageOnReturn === true) {
    goToNextMessageOnReturn = true
  }

  // Get next message
  const nextMessage = nextStageInFlow.getMessage(updatedChatContext)
  const nextMessageWithLineBreaks = nextMessage.replace(/\n/g, "<br/>")

  const nextChatFlowIndex = chatFlowIndex + 1
  const isLastMessageInFlow =
    CHAT_FLOWS[questName][roomId].messages.length - 1 === nextChatFlowIndex

  // Refecth the room data
  const updatedRoomSnapshot = await roomRef.get()
  const updatedRoomData = updatedRoomSnapshot.data()

  // Check if the last message set time has changed since we set it
  // If it has, that means another request is already in progress
  // and we should do nothing. This is an edge case becuase we check
  // above if the last message was already set within 2 seconds.
  // @ts-ignore
  if (updatedRoomData.lastMessageSetAt !== updateTime) {
    console.log("==> Aborting, another request is already in progress")
    return res.status(200).json({ success: true, newStage: false })
  }

  await roomRef.update({
    chatFlowIndex: nextChatFlowIndex,
    isLastMessageInFlow,
    characterMessage: nextMessageWithLineBreaks,
    chatContext: updatedChatContext,
    lastMessageSetAt: Date.now(),
    chatInputText: "",
    goToNextMessageOnReturn,
    // back to false once it's set to true
    ...updatedTimerData,
  })

  return res.status(200).json({ success: true, newStage: true })
}

const escapeHtml = (unsafe: string): string => {
  return unsafe.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m] || m)
  ) // Fallback to 'm' if not in the mapping
}
