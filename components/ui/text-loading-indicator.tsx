import React from "react"

const TextLoadingIndicator = () => (
  <div className="flex space-x-2">
    <div
      className="h-2 w-2 rounded-full bg-gray-900"
      style={{ animationDelay: "0ms" }}
    />
    <div
      className="h-2 w-2 rounded-full bg-gray-900"
      style={{ animationDelay: "200ms" }}
    />
    <div
      className="h-2 w-2 rounded-full bg-gray-900"
      style={{ animationDelay: "400ms" }}
    />
  </div>
)

export default TextLoadingIndicator
