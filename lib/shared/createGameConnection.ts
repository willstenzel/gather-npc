import { Game } from "@gathertown/gather-game-client"

export const createGameConnection = async (gatherSpaceId: string) => {
  // Create a connection with the game server
  const game = new Game(gatherSpaceId, () =>
    Promise.resolve({ apiKey: process.env.GATHER_API_KEY! })
  )

  game.connect()

  // Wait for the game to connect
  await new Promise((resolve) =>
    game.subscribeToConnection((connected) => {
      if (connected) {
        resolve(null)
      }
    })
  )

  // Wait for the players to be initialized
  await game.waitForInit()

  return game
}
