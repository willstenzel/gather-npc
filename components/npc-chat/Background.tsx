type BackgroundProps = {
  questName: string
  roomId: string
}

const Background = ({ questName, roomId }: BackgroundProps) => (
  <div className="fixed inset-0 z-[-1]">
    <img
      className="h-full w-full object-cover"
      src={`/quests/${questName}/${roomId}-background.png`}
      alt="background"
    />
  </div>
)

export default Background
