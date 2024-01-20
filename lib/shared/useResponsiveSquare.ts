import { useEffect, useRef, useState } from "react"

export const useResponsiveSquare = (margin = 0) => {
  const [dimension, setDimension] = useState(0)
  const textRef = useRef(null)

  const updateDimensions = () => {
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    // @ts-ignore
    const textHeight = textRef.current ? textRef.current.offsetHeight : 0

    const availableHeight = windowHeight - textHeight - margin
    const minDimension = Math.min(availableHeight, windowWidth, 512)

    setDimension(minDimension)
  }

  useEffect(() => {
    if (!textRef.current) return

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [textRef.current])

  return { dimension, textRef }
}
