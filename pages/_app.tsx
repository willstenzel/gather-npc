import { useRouter } from "next/router"

import { Toaster } from "@/components/ui/toaster"

import "@/styles/globals.css"
import { useEffect } from "react"
import type { AppProps } from "next/app"

import { handleFirestoreSynchronization } from "@/lib/npc-chat/useSynchronizedChat"
import { useGlobalsStore } from "@/lib/shared/useGlobalsStore"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const { setGlobals } = useGlobalsStore()

  // Set the query params as global state
  const { roomId, questName } = router.query

  useEffect(() => {
    const requiredQueryParams = ["roomId", "questName"]

    const missingParams = requiredQueryParams.filter(
      (param) => !router.query[param]
    )

    if (missingParams.length === requiredQueryParams.length) {
      // No query params are present
    } else if (missingParams.length === 0) {
      // All query params are present
      setGlobals({
        roomId: roomId as string,
        questName: questName as string,
      })
    } else {
      // Some but not all of query params are present
      throw new Error(`Invalid URL - Missing ${missingParams.join(", ")}`)
    }
  }, [roomId, questName])

  const { initialState } = pageProps

  useEffect(() => {
    if (initialState) {
      // Hydrate the chat store with server-side data
      handleFirestoreSynchronization(initialState.roomState, {
        roomId: roomId as string,
        questName: questName as string,
      })
    }
  }, [initialState, roomId, questName])

  return (
    <>
      <Component {...pageProps} />
      <Toaster />
    </>
  )
}
