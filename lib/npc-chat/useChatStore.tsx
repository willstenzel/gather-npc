import { create } from "zustand"
import { devtools } from "zustand/middleware"

import { makeRequest } from "../shared/makeRequest"
import { useGlobalsStore } from "../shared/useGlobalsStore"
import { getWordsAndTagsFromString } from "./helpers"
import {
  updateFirestoreOnInputChange,
  updateFirestoreOnInputSubmit,
} from "./useSynchronizedChat"

interface NpcChatState {
  // ------------------- State ------------------- //
  // Character
  characterMessage: string
  wordIndex: number

  // Chat Input
  chatInputText: string
  submittedText: string | null

  // Other
  hydratedStore: boolean

  // ------------------- Actions ------------------- //
  incrementWordIndex: () => boolean
  handleChatInputChange: (event: any) => void
  handleChatInputSubmit: (e: React.FormEvent) => Promise<void>
  setChatInputText: (text: string) => void
  setSubmittedText: (text: string | null) => void
  setWordIndex: (wordIndex: number) => void
  setCharacterMessage: (message: string) => void
  setHydratedStore: (hydrated: boolean) => void
}

export const useChatStore = create<NpcChatState>()(
  devtools(
    (set, get) => ({
      // ------------------- State ------------------- //
      // Character
      characterMessage: "" as string,
      wordIndex: 1,

      // Chat Input
      chatInputText: "",
      submittedText: null as string | null,

      // Other
      hydratedStore: false as boolean,

      // ------------------- Actions ------------------- //
      // Character
      incrementWordIndex: () => {
        if (get().characterMessage === "") {
          return false
        }

        set((state) => ({
          wordIndex: state.wordIndex + 1,
        }))

        const isEndOfMessage =
          get().wordIndex >
          getWordsAndTagsFromString(get().characterMessage).length
        return isEndOfMessage
      },

      // Chat
      handleChatInputChange: (event: any) => {
        const newValue = event.target.value
        set({ chatInputText: newValue })

        updateFirestoreOnInputChange({
          questName: useGlobalsStore.getState().questName,
          roomId: useGlobalsStore.getState().roomId,
          value: newValue,
        })
      },
      setSubmittedText: (text: string | null) => {
        set({ submittedText: text })
      },
      setChatInputText: (text: string) => {
        set({ chatInputText: text })
      },
      setCharacterMessage: (message: string) => {
        set({ characterMessage: message })
      },
      setWordIndex: (wordIndex: number) => {
        set({ wordIndex })
      },
      handleChatInputSubmit: async (e: React.FormEvent) => {
        e.preventDefault()
        const submittedText = get().chatInputText

        updateFirestoreOnInputSubmit({
          questName: useGlobalsStore.getState().questName,
          roomId: useGlobalsStore.getState().roomId,
          submittedText,
        })

        set((state) => ({
          submittedText: state.chatInputText,
          chatInputText: "",
        }))

        // This will update Firestore with the next message
        // and a listener in useSynchronizedChat will update
        // the characterMessage state
        await makeRequest("/api/get-next-message", {
          body: {
            submittedText,
          },
        })
      },
      // Other
      setHydratedStore: (hydrated: boolean) => {
        set({ hydratedStore: hydrated })
      },
    }),
    {
      name: "npc-chat-store",
    }
  )
)
