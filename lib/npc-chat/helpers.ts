export const getWordsAndTagsFromString = (characterMessage: string) => {
  // Regex to match all words and tags
  const regex = /(<[^>]*>)|\S+/g
  const wordsAndTags = characterMessage.match(regex) || []

  return wordsAndTags
}
