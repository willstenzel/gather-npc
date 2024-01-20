import { openai } from "./openaiClient"

type ChatFlowType = {
  // Quest ID
  [key: string]: {
    // Room ID of NPC
    [key: string]: {
      messages: {
        minutesToComplete?: () => number
        addContextFromPreviousResponse?: (
          response: string
        ) => Promise<Record<string, any>>
        getMessage: (chatContext: Record<string, any>) => string
        goToNextMessageOnReturn?: boolean
      }[] // Steps
    }
  }
}

export const CHAT_FLOWS: ChatFlowType = {
  "test-quest": {
    "chapter-1": {
      messages: [
        {
          getMessage: (context) =>
            `Welcome to Chapter 1 of the Test Quest!

            My name is MetaWidget Explorer 2000, but you can call me Widget.
            
            I'll be your sidekick during this quest.
            
            When everyone has arrived, type “ready” into the chat.`,
        },
        {
          getMessage: (context) =>
            `I’m so glad you’re here.

            A couple notes about chatting with me:
            
            First, everyone who pressed “X” to interact with me just now is looking at the same screen.
            
            Second, I've found that interacting with me as a group is easiest when you assign one person to be the "speaker.” That person will type in the chat and I'll respond to them.
            
            Who would like to be the speaker for your team? Write your name in the chat.`,
        },
        {
          addContextFromPreviousResponse: async (response: string) => {
            const speakerName = response

            return { speakerName }
          },
          getMessage: (context) =>
            `Hi, ${context.speakerName}! Thanks for volunteering.

            Welcome, adventurers. Let’s get started.
            
            Every hero has a quest. Lancelot and Galahad sought the Holy Grail. Frodo set out to destroy the One Ring. Dorothy’s adventure led her home.

            Can you think of another hero on a quest? Type their name and the story they’re from into the chat.`,
        },
        {
          addContextFromPreviousResponse: async (response: string) => {
            const heroNameAndStory = response

            const completion = await openai.createChatCompletion({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are an enthusiastic character that likes to share your thoughts. You are required to respond with only a single sentence.",
                },
                {
                  role: "user",
                  content: `Given the character and story "${heroNameAndStory}" please respond with one sentence about the plot point you liked most. Start the response with the words "What I liked the most about that story was"`,
                },
              ],
              max_tokens: 256,
            })

            const heroNameAssociation =
              completion.data.choices[0].message?.content

            return { heroNameAssociation }
          },
          getMessage: (context) =>
            `Great example! ${context.heroNameAssociation}

            In the story of your life, of course, <i>you</i> are the hero.
            
            The goal of our virtual adventure is to pinpoint a treasure you seek in real life. The one that you are “working toward” when you do your work.
            
            Sound good? Type “let’s go” when you’re ready.`,
        },
        {
          minutesToComplete: () => {
            return 4
          },
          getMessage: (context) =>
            `Excellent! Before we dive in, let’s warm up—with play.

            In my experience with robot friends (and according to scientific research), play is good for people of all ages.
            
            When was the last time you played or did something that felt like play?
            
            You have 4 minutes to discuss with your questmates.`,
        },
        {
          getMessage: (context) =>
            `Thanks for trying out the test quest. This is an example of the kind of experience you can create for your own community.

            I'm excited to see what you come up with!`,
        },
      ],
    },
  },
}
