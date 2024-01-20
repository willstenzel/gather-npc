import { useEffect } from "react"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"

import { SHOW_WORD_EVERY_N_MILLISECONDS } from "@/components/npc-chat/Character"

import { db } from "../shared/initFirebaseClient"
import { makeRequest } from "../shared/makeRequest"
import { useGlobalsStore } from "../shared/useGlobalsStore"
import { getWordsAndTagsFromString } from "./helpers"
import { useChatStore } from "./useChatStore"

type QuestRoomFirestoreData = {
  characterMessage: string
  chatContext: { [key: string]: string }
  chatFlowIndex: number
  chatInputText: string
  goToNextMessageOnReturn: boolean
  inUnmodifiedState: boolean
  isLastMessageInFlow: boolean
  lastMessageSetAt: number // Date in milliseconds
  minutesToComplete: number | null
  submittedText: string | null
  timerCompleteTime: number // Date in milliseconds
  timerMinutesToComplete: number
}

export const useSynchronizedChat = ({
  questName,
  roomId,
}: {
  questName: string
  roomId: string
}) => {
  // Set up listeners for snapshot updates in Firestore
  // This will pull in the initial state and listen for updates
  useEffect(() => {
    const roomRef = doc(db, `quests/${questName}/rooms/${roomId}`)

    const unsubscribe = onSnapshot(roomRef, (doc) => {
      const data = doc.data()

      if (!data) return

      handleFirestoreSynchronization(data as QuestRoomFirestoreData, {
        questName,
        roomId,
      })
    })
    return () => {
      unsubscribe()
    }
  }, [])
}

export const handleFirestoreSynchronization = (
  questData: QuestRoomFirestoreData,
  { questName, roomId }: { questName: string; roomId: string }
) => {
  const {
    hydratedStore,
    setHydratedStore,
    setChatInputText,
    setSubmittedText,
  } = useChatStore.getState()

  const {
    characterMessage: currentCharacterMessage,
    submittedText: currentSubmittedText,
  } = useChatStore.getState()

  // Clear the chat input if sometime else has submitted a message
  if (questData.submittedText !== currentSubmittedText) {
    setSubmittedText(questData.submittedText)
    setChatInputText("")
  }

  setChatInputText(questData.chatInputText)

  if (currentCharacterMessage !== questData.characterMessage) {
    handleNewCharacterMessage(questData)
  }

  // If this is the first page load, perform certain logic
  if (!hydratedStore) {
    const { skipInitialDataSync } = handleInitialPageLoad(questData, {
      questName,
      roomId,
    })

    if (skipInitialDataSync) return

    setHydratedStore(true)
  }
}

const handleNewCharacterMessage = async (questData: QuestRoomFirestoreData) => {
  const { setWordIndex, setCharacterMessage } = useChatStore.getState()

  const {
    timerCompleteTime,
    setTimerStartTime,
    setTimerCompleteTime,
    setTimerMinutesToComplete,
    setShowTimer,
  } = useGlobalsStore.getState()

  // Get the time since the last message was set and subtract
  // 100 milliseconds to account for delay from server

  const timeSinceLastMessage = Date.now() - questData.lastMessageSetAt - 100

  let newWordIndex = 1

  const maxWordIndex = getWordsAndTagsFromString(
    questData.characterMessage
  ).length

  // If the timeSinceLastMessage is less than 0 we don't need to adjust the word index
  if (timeSinceLastMessage > 0) {
    newWordIndex =
      Math.floor(timeSinceLastMessage / SHOW_WORD_EVERY_N_MILLISECONDS) + 1

    // If the new word index is greater than the max word index
    // then set it to the max word index
    if (newWordIndex > maxWordIndex) {
      newWordIndex = maxWordIndex
    }
  }

  // Handle initially showing the timer
  if (timerCompleteTime === null && questData.timerCompleteTime !== null) {
    // Set the start time of the timer to be the time the last message was set
    // plus the time it took to show the last message (maxWordIndex * SHOW_WORD_EVERY_N_MILLISECONDS)
    // plus a bit of extra time for the server delay (500 ms)
    const timerStartTime =
      questData.lastMessageSetAt +
      (maxWordIndex + 1) * SHOW_WORD_EVERY_N_MILLISECONDS +
      500

    // Set minutes to complete
    setTimerMinutesToComplete(questData.timerMinutesToComplete)

    // Set the timer start time
    setTimerStartTime(timerStartTime)

    // Set the timer complete time
    setTimerCompleteTime(questData.timerCompleteTime)

    if (newWordIndex >= maxWordIndex) {
      setShowTimer(true)
    }

    if (newWordIndex < maxWordIndex) {
      // Set a timeout to show the timer when the character message is complete
      const numberOfWordsLeft = maxWordIndex - newWordIndex + 1
      const showTimerDelay =
        numberOfWordsLeft * SHOW_WORD_EVERY_N_MILLISECONDS + 500 // Add 500 ms showing the timer for server delay

      setTimeout(() => {
        setShowTimer(true)
      }, showTimerDelay)
    }
  }

  // If the timer is not needed for this message reset all local data
  if (questData.timerCompleteTime === null) {
    setTimerStartTime(null)
    setTimerCompleteTime(null)
    setTimerMinutesToComplete(null)
    setShowTimer(false)
  }

  // Set the word index and the character message
  setWordIndex(newWordIndex)
  setCharacterMessage(questData.characterMessage)
}

const handleInitialPageLoad = (
  questData: any,
  { questName, roomId }: { questName: string; roomId: string }
) => {
  // If the quest is in an unmodified state, then we need to get the first message from the server
  if (questData.inUnmodifiedState) {
    // Get the first message from the server
    makeRequest("/api/get-first-message")
  }

  if (questData.goToNextMessageOnReturn) {
    makeRequest("/api/get-next-message")

    // Skip the initial data sync because will be waiting for new data
    return { skipInitialDataSync: true }
  }

  return { skipInitialDataSync: false }
}

export const updateFirestoreOnInputChange = ({
  questName,
  roomId,
  value,
}: {
  questName: string
  roomId: string
  value: string
}) => {
  const roomRef = doc(db, `quests/${questName}/rooms/${roomId}`)

  updateDoc(roomRef, {
    chatInputText: value,
  })
}

export const updateFirestoreOnInputSubmit = ({
  questName,
  roomId,
  submittedText,
}: {
  questName: string
  roomId: string
  submittedText: string
}) => {
  const roomRef = doc(db, `quests/${questName}/rooms/${roomId}`)

  updateDoc(roomRef, {
    submittedText: submittedText,
    chatInputText: "",
  })

  // Reset the submitted text so that if someone reloads the page
  // the submitted text doesn't show when their state is synced with Firestore
  updateDoc(roomRef, {
    submittedText: null,
  })
}
