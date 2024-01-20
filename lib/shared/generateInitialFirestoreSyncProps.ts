import { GetServerSidePropsContext } from "next"

import { initFirebaseAdmin } from "./initFirebaseAdmin"

export async function generateInitialFirestoreSyncProps(
  context: GetServerSidePropsContext
) {
  const db = initFirebaseAdmin()

  const questName = context.query.questName
  const roomId = context.query.roomId

  const questRef = db.collection("quests").doc(questName as string)
  const questDoc = await questRef.get()
  const questData = questDoc.data()

  if (!questData) throw new Error("quest data not found in getServerSideProps")

  const roomRef = questRef.collection("rooms").doc(roomId as string)
  const roomDoc = await roomRef.get()
  const roomData = roomDoc.data()

  if (!roomData) throw new Error("room data not found in getServerSideProps")

  return {
    initialState: {
      roomState: {
        ...roomData,
      },
      questState: questData,
    },
  }
}
