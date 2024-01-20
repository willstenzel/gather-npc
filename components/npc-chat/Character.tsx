import { useEffect } from "react"

import { getWordsAndTagsFromString } from "@/lib/npc-chat/helpers"
import { useChatStore } from "@/lib/npc-chat/useChatStore"

import TextLoadingIndicator from "../ui/text-loading-indicator"

export const SHOW_WORD_EVERY_N_MILLISECONDS =
  process.env.NODE_ENV === "development" ? 10 : 150

type CharacterProps = {
  questName: string
  roomId: string
}

const Character = ({ questName, roomId }: CharacterProps) => {
  const { characterMessage, wordIndex } = useChatStore()

  const wordsAndTags = getWordsAndTagsFromString(characterMessage)

  const viewableCharacterMessage = wordsAndTags.slice(0, wordIndex).join(" ")

  const incrementWordIndex = useChatStore((state) => state.incrementWordIndex)

  useEffect(() => {
    let interval: NodeJS.Timeout
    interval = setInterval(() => {
      const isMessageComplete = incrementWordIndex()

      if (isMessageComplete) {
        return clearInterval(interval)
      }
    }, SHOW_WORD_EVERY_N_MILLISECONDS)
    return () => {
      clearInterval(interval)
    }
  }, [characterMessage])

  return (
    <div className="flex h-screen w-screen items-center justify-evenly">
      <img
        className="fixed bottom-0 mr-[40%] h-full min-w-fit"
        src={`/quests/${questName}/character.png`}
        alt="NPC Character"
      />
      <div className="relative mb-[7%] ml-[30%] max-w-md whitespace-pre-line rounded-lg border-2 border-black bg-gray-200 p-5 text-sm">
        {characterMessage === "" ? (
          <TextLoadingIndicator />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: viewableCharacterMessage }} />
        )}
      </div>
    </div>
  )
}

export default Character
