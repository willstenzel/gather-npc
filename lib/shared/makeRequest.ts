import { useGlobalsStore } from "./useGlobalsStore"

export const makeRequest = async (
  url: string,
  {
    body,
  }: {
    body?: any
  } = {}
) => {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...body,
      globals: {
        questName: useGlobalsStore.getState().questName,
        roomId: useGlobalsStore.getState().roomId,
      },
    }),
  })

  return res
}
