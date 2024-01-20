import { AnimatePresence, motion } from "framer-motion"

import { getWordsAndTagsFromString } from "@/lib/npc-chat/helpers"
import { useChatStore } from "@/lib/npc-chat/useChatStore"

const ChatInput = () => {
  // State
  const { chatInputText, submittedText } = useChatStore()
  const characterMessageInProgress = useChatStore(
    (state) =>
      state.characterMessage === "" ||
      state.wordIndex <=
        getWordsAndTagsFromString(state.characterMessage).length
  )

  // Actions
  const { handleChatInputChange, handleChatInputSubmit } = useChatStore()

  return (
    <div className="fixed bottom-6 left-1/2 w-3/4 -translate-x-1/2 transform bg-transparent">
      <div className="relative">
        <AnimatePresence>
          {submittedText && (
            <motion.div
              key={submittedText}
              className="absolute bottom-full w-full rounded-md border border-gray-300 bg-white p-4 text-gray-600"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -50 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 2 }}
            >
              {submittedText}
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleChatInputSubmit} className="w-full">
          <div className="relative flex">
            <input
              type="text"
              onChange={handleChatInputChange}
              value={chatInputText}
              className="show-on-fullstory grow rounded-md bg-gray-200 py-4 pl-6 pr-28 text-gray-600 placeholder:text-gray-600 focus:outline-none focus:placeholder:text-gray-400"
              placeholder="Type here..."
            />
            <button
              type="submit"
              disabled={characterMessageInProgress}
              className={`absolute right-0 top-2.5 mr-2 rounded-md bg-blue-950 px-4 py-2 text-sm text-white focus:outline-none ${
                characterMessageInProgress
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
