import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface GlobalsState {
  // ------------------- State ------------------- //
  questName: string
  roomId: string
  timerStartTime: number | null
  timerCompleteTime: number | null
  timerMinutesToComplete: number | null
  showTimer: boolean

  // ------------------- Actions ------------------- //
  setGlobals: ({
    questName,
    roomId,
  }: {
    questName: string
    roomId: string
  }) => void
  setTimerStartTime: (timerStartTime: number | null) => void
  setTimerCompleteTime: (timerCompleteTime: number | null) => void
  setTimerMinutesToComplete: (timerMinutesToComplete: number | null) => void
  setShowTimer: (showTimer: boolean) => void
}

export const useGlobalsStore = create<GlobalsState>()(
  devtools(
    (set, get) => ({
      // ------------------- State ------------------- //
      questName: "",
      roomId: "",
      showTimer: false,
      timerStartTime: null,
      timerCompleteTime: null,
      timerMinutesToComplete: null,

      // ------------------- Actions ------------------- //
      setGlobals: ({ questName, roomId }) => {
        set({
          questName,
          roomId,
        })
      },
      setShowTimer: (showTimer) => {
        set({ showTimer: showTimer })
      },
      setTimerStartTime: (timerStartTime) => {
        set({ timerStartTime: timerStartTime })
      },
      setTimerCompleteTime: (timerCompleteTime) => {
        set({ timerCompleteTime: timerCompleteTime })
      },
      setTimerMinutesToComplete: (timerMinutesToComplete) => {
        set({ timerMinutesToComplete: timerMinutesToComplete })
      },
    }),
    {
      name: "globals-store",
    }
  )
)
