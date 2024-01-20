import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Timer as TimerIcon } from "lucide-react"

import { makeRequest } from "@/lib/shared/makeRequest"
import { useGlobalsStore } from "@/lib/shared/useGlobalsStore"

import { Button } from "../ui/button"
import { Progress } from "../ui/progress"

const NpcTimer = () => {
  const {
    showTimer,
    setShowTimer,
    timerMinutesToComplete,
    timerStartTime,
    timerCompleteTime,
  } = useGlobalsStore()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showTimer || !timerStartTime || !timerCompleteTime) return

    const totalDuration = timerCompleteTime - timerStartTime

    let interval: NodeJS.Timeout

    const updateProgress = () => {
      const currentTime = Date.now()
      const currentProgress =
        ((currentTime - timerStartTime) / totalDuration) * 100

      setProgress(currentProgress)

      if (currentProgress >= 100) {
        setProgress(100)
        makeRequest("/api/get-next-message")
        clearInterval(interval)
        return
      }
    }

    updateProgress() // Initial update

    interval = setInterval(updateProgress, 125) // Update every 125 ms to look smooth

    return () => {
      clearInterval(interval)
    }
  }, [showTimer])

  return (
    <AnimatePresence mode="wait">
      {showTimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-0 top-0 z-50 m-4"
        >
          <div>
            <div className="relative max-w-[280px] rounded-lg border bg-background p-3 text-foreground">
              <div className="flex flex-row items-center">
                <TimerIcon strokeWidth={2} className="mr-2 h-7 w-7" />
                <Progress value={progress} className="mr-1 mt-[2px] w-full" />
              </div>
              <div className="mt-3 flex items-center">
                <div className="text-sm leading-none">
                  You have {timerMinutesToComplete} minutes to complete this
                  section
                </div>
                <Button
                  className="rounded-md bg-blue-950 ring-gray-300 hover:bg-blue-950"
                  onClick={() => {
                    makeRequest("/api/get-next-message")
                    setTimeout(() => {
                      setShowTimer(false)
                    }, 250)
                  }}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NpcTimer
