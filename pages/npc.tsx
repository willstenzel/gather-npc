import React from "react"
import { GetServerSidePropsContext } from "next"
import { AnimatePresence, motion } from "framer-motion"

import { useChatStore } from "@/lib/npc-chat/useChatStore"
import { useSynchronizedChat } from "@/lib/npc-chat/useSynchronizedChat"
import { generateInitialFirestoreSyncProps } from "@/lib/shared/generateInitialFirestoreSyncProps"
import { useGlobalsStore } from "@/lib/shared/useGlobalsStore"
import Background from "@/components/npc-chat/Background"
import Character from "@/components/npc-chat/Character"
import ChatInput from "@/components/npc-chat/ChatInput"
import NpcTimer from "@/components/npc-chat/NpcTimer"

interface NPCProps {
  roomId: string
  questName: string
}

const NPC = ({ roomId, questName }: NPCProps) => {
  useSynchronizedChat({ questName, roomId })

  const { hydratedStore } = useChatStore()

  return hydratedStore ? (
    <main className="h-screen">
      <NpcTimer />
      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          style={{ maxWidth: "40rem" }}
        >
          <>
            <Background questName={questName} roomId={roomId} />
            <Character questName={questName} roomId={roomId} />
            <ChatInput />
          </>
        </motion.div>
      </AnimatePresence>
    </main>
  ) : null
}

// This wrapper component is used to get the questName and roomId
// before rendering the NPC component.
const NPCWrapper = () => {
  const { roomId, questName } = useGlobalsStore()

  if (!roomId || !questName) {
    return <></>
  }

  return <NPC roomId={roomId as string} questName={questName as string} />
}

export default NPCWrapper

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const initialProps = await generateInitialFirestoreSyncProps(context)

  console.log("context", context)

  return {
    props: {
      ...initialProps,
    },
  }
}
