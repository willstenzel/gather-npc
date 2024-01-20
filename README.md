## Customizable Chat Interface for NPCs in Gather

This project introduces an embeddable chat interface that enables synchronized communication between players and NPCs in Gather spaces. It uses OpenAI's API for advanced conversational capabilities and Firebase's Firestore for real-time data synchronization. The chat interface opens up opportunities for new types of experiences in Gather like interactive storytelling, educational simulations, and collaborative games.

## Prerequisites

Before you begin setting up this customizable chat interface for NPCs in Gather, make sure you have the following prerequisites in place:

1. <b>Node.js and npm/yarn:</b> You'll need Node.js installed on your computer to run the server-side code. npm (Node Package Manager) or yarn is used to manage the project's dependencies. You can download Node.js, which includes npm, from [here](https://nodejs.org/). If you prefer yarn, you can find installation instructions [here](https://yarnpkg.com/getting-started/install).

2. <b>Firebase Account:</b> A Firebase account is required to use Firestore. If you don't have a Firebase account, you can create one for free [here](https://firebase.google.com/).

3. <b>Gather Account:</b> You'll need an account on Gather to create a space and deploy your NPC. Sign up or log in at [Gather](https://www.gather.town/).

4. <b>Google Cloud Account:</b> To deploy the app, you'll need a Google Cloud account for access to Google Cloud Run. You can sign up for an account [here](https://cloud.google.com/).

5. <b>Visual Studio Code (VS Code):</b> This guide assumes you are using VS Code with the Cloud Code extension for deploying to Google Cloud Run. You can download VS Code [here](https://code.visualstudio.com/download) and find the Cloud Code extension in the VS Code Marketplace.

6. <b>Basic Knowledge of Web Technologies:</b> Familiarity with JavaScript, web development, and cloud services will be helpful in understanding and setting up the project.

Ensure that you have these prerequisites set up and ready before proceeding with the installation and configuration of the chat interface for NPCs in Gather.

## Setup Guide

<b>1. Install dependencies</b>

```bash
npm install
# or
yarn install
```

<b>2. Setup Firebase projects and create Firestore</b><br/>
To get this code up and running, you'll need a Firestore database with a schema of collections and documents that like this: `/quests/test-quest/rooms/chapter-1` (see below for example). Don't worry about populating the data inside the `chapter-1` document for now.

<details>
    <summary>Show Firestore Setup</summary>
</details></br>

<b>3. Add base credentials to `initFirebaseClient.ts` file</b><br/>
Additional info can be found [here](https://firebase.google.com/docs/web/learn-more#config-object)

<b>4. Create an `.env.local` and add environment variables</b><br/>
These are the env vars you will need:<br/>

- [OPENAI_API_KEY](https://help.openai.com/en/articles/4936850-where-do-i-find-my-api-key)
- [GATHER_API_KEY](https://app.gather.town/apikeys)
- [GATHER_SPACE_ID](https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063)
  (e.g. hlsuaqSyfnA8Jvy\\\Test Quest)

<b>5. Deploy the app to Google Cloud Run</b><br/>
The easiest way to do this is using the Cloud Code extension in VS Code to deploy the app to a Cloud Run instance. Once it's deployed you will want to note down the url.

<b>6. Add environment variables to Cloud Run</b><br/>
To do this follow [these steps](https://cloud.google.com/run/docs/configuring/services/environment-variables).

<b>7. Create a Gather space with an npc object in it</b><br/>
Go to the Gather app and create a new space. Using the mapmaker add a new object with the "Embedded Website" option, using this for the url: `https://<your-cloud-run-url>/npc?questName=test-quest&roomId=chapter-1`

<b>8. Make a request to the space reset API</b><br/>
This will populate the Firestore database with the initial data (or reset if the data already exists). This is done by making a request to this url: `https://<your-cloud-run-url>/api/space-reset?questName=test-quest`. If everything is working correctly you should see the message `{"success":true,"message":"Space reset"}`

Your NPC should now be ready to interact with! Go into the Gather space, press "X" to interact with the character, and the chat interface should pop up. When you want to reset the chat, make a new request to the space reset API shown in the last step.

If you have any questions feel free to DM on X [@WillStenzel](https://x.com/willstenzel).
