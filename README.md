# Voice AI with deepgram API

A headless React component designed to drastically simplify the integration of Deepgram's real-time transcription and voice agent capabilities into web applications. It handles the low-level complexities of WebSocket connections, browser microphone access, and agent audio playback, allowing you to focus on building your application's UI and logic.

## Features

-   **Real-time Transcription:** Streams microphone audio to Deepgram's Speech-to-Text API and provides live results.
-   **Voice Agent Interaction:** Connects to Deepgram's Voice Agent API, enabling two-way voice conversations.
-   **Microphone Handling:** Manages browser microphone access (requesting permissions) and audio capture using the Web Audio API.
-   **Agent Audio Playback:** Automatically plays audio responses received from the voice agent using the Web Audio API.
-   **Robust Control:** Provides methods to programmatically start, stop, interrupt the agent, toggle sleep mode, update agent instructions, and inject messages.
-   **Event-Driven:** Uses callbacks (`props`) to deliver transcription updates, agent state changes, agent utterances, user messages, connection status, errors, and more.
*   **Keyterm Prompting:** Supports Deepgram's Keyterm Prompting feature for improved accuracy on specific terms (requires Nova-3 model).
*   **Sleep/Wake:** Includes functionality to put the agent into a sleep state where it ignores audio input until explicitly woken.
-   **Headless:** Contains **no UI elements**, giving you complete control over the look and feel of your application.
-   **TypeScript:** Built with TypeScript for enhanced type safety and developer experience.

## Installation

```bash
npm install aixblock-voice-ai-deepgram
# or
yarn add aixblock-voice-ai-deepgram
```

*(Note: For local development, adjust the path as needed.)*

## Encode config
```ts
const voiceConfig = window.atob(<KEY_COPIED_FROM_BLOCK>);
```

## Getting Started

This component simplifies complex interactions. Here's how to get started with common use cases:

### 1. Real-time communication with AI
```tsx
import {
  type TranscriptResponse,
  type LLMResponse,
  VoiceAI,
} from "aixblock-voice-ai-deepgram";
import { useRef, useState } from "react";

const voiceConfig = "<KEY_COPIED_FROM_BLOCK>";

const VoiceAI = () => {
  const deepgramRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const onReady = (ready: boolean) => {
    console.log(`Component is ${ready ? "ready" : "not ready"}`);
  };
  const onTranscriptUpdate = (transcript: TranscriptResponse) => {
    console.log("Full transcript response:", transcript);
  };
  const onAgentUtterance = (utterance: LLMResponse) => {
    console.log(`Agent said: ${utterance.text}`);
  };
  const startInteraction = async () => {
    try {
      await deepgramRef.current?.start();
      setIsRecording(true);
      console.log("Started interaction");
    } catch (error) {
      console.log(`Error starting: ${(error as Error).message}`);
      console.error("Start error:", error);
    }
  };

  const stopInteraction = async () => {
    try {
      await deepgramRef.current?.stop();
      setIsRecording(false);
      console.log("Stopped interaction");
    } catch (error) {
      console.log(`Error stopping: ${(error as Error).message}`);
      console.error("Stop error:", error);
    }
  };
  return (
    <>
      <VoiceAI
        voiceConfig={voiceConfig}
        deepgramRef={deepgramRef}
        onReady={onReady}
        onTranscriptUpdate={onTranscriptUpdate}
        onAgentUtterance={onAgentUtterance}
      />

      {!isRecording ? (
        <button
          onClick={startInteraction}
          disabled={isRecording}
          style={{ padding: "10px 20px" }}
        >
          Start
        </button>
      ) : (
        <button
          onClick={stopInteraction}
          disabled={!isRecording}
          style={{ padding: "10px 20px" }}
        >
          Stop
        </button>
      )}
    </>
  );
};
```

### 2. Basic Real-time Transcription (Transcription Only Mode)

This example focuses solely on getting live transcripts from microphone input.

```tsx
import React, { useRef, useState, useCallback, useMemo } from 'react';
// Adjust import path based on your setup (package vs local)
import { DeepgramVoiceInteraction } from 'aixblock-voice-ai-deepgram'; 
import type { 
  DeepgramVoiceInteractionHandle, 
  TranscriptResponse,
  TranscriptionOptions,
  DeepgramError 
} from 'aixblock-voice-ai-deepgram';

function SimpleTranscriber() {
  const deepgramRef = useRef<DeepgramVoiceInteractionHandle>(null);
  const [isReady, setIsReady] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  // Define transcription options (use useMemo to prevent unnecessary re-renders)
  const transcriptionOptions = useMemo<TranscriptionOptions>(() => ({
    model: voiceConfig.model, // Or your preferred model
    language: voiceConfig.language,
    interim_results: true,
    smart_format: true,
  }), []);
  
  // --- Callbacks ---
  const handleReady = useCallback((ready: boolean) => {
    console.log(`Transcription component ready: ${ready}`);
    setIsReady(ready);
  }, []);

  const handleTranscriptUpdate = useCallback((transcript: TranscriptResponse) => {
    if (transcript.is_final && transcript.channel?.alternatives?.[0]) {
      const text = transcript.channel.alternatives[0].transcript;
      console.log('Final transcript:', text);
      setLastTranscript(text);
    } else if (transcript.channel?.alternatives?.[0]) {
      // Handle interim results if needed
      // console.log('Interim transcript:', transcript.channel.alternatives[0].transcript);
    }
  }, []);
  
  const handleError = useCallback((error: DeepgramError) => {
    console.error('Deepgram Error:', error);
  }, []);

  // --- Control Functions ---
  const startTranscription = () => deepgramRef.current?.start();
  const stopTranscription = () => deepgramRef.current?.stop();
  
  return (
    <div>
      <h1>Live Transcription</h1>
      
      <DeepgramVoiceInteraction
        ref={deepgramRef}
        apiKey={voiceConfig.auth}
        transcriptionOptions={transcriptionOptions}
        // IMPORTANT: agentOptions prop is completely omitted, not just empty
        onReady={handleReady}
        onTranscriptUpdate={handleTranscriptUpdate}
        onError={handleError}
        debug={true} // Enable console logs from the component
      />
      
      <div>
        <button onClick={startTranscription} disabled={!isReady}>Start Transcribing</button>
        <button onClick={stopTranscription} disabled={!isReady}>Stop Transcribing</button>
      </div>
      
      <h2>Last Transcript:</h2>
      <p>{lastTranscript || '(Waiting...)'}</p>
    </div>
  );
}

export default SimpleTranscriber;
```

### Keyterm Prompting

To improve recognition of specific words or phrases, use the `keyterm` option within `transcriptionOptions`. **Note:** This currently only works with `model: 'nova-3'` and for English.

```tsx
<DeepgramVoiceInteraction
  // ...
  transcriptionOptions={{
    model: 'nova-3', // Required for keyterm
    language: 'en',  // Required for keyterm
    keyterm: ["Deepgram", "Casella", "Symbiosis", "Board Meeting AI"] 
  }}
  // ...
/>
```

The component handles appending each keyterm correctly to the WebSocket URL. Phrases with spaces are automatically encoded.

## Troubleshooting / Debugging

*   **Enable Debug Logs:** Pass the `debug={true}` prop to the component. This will print detailed logs from the component's internal operations, state changes, WebSocket messages, and audio processing steps to the browser's developer console. Look for messages prefixed with `[DeepgramVoiceInteraction]` and `[SLEEP_CYCLE]`.
*   **Check API Key:** Ensure your Deepgram API key is correct and has the necessary permissions.
*   **Microphone Permissions:** Make sure the user has granted microphone access permissions to your site in the browser. Check browser settings if the prompt doesn't appear.
*   **Network Tab:** Use your browser's developer tools (Network tab, filtered to WS/WebSockets) to inspect the WebSocket connections, messages being sent/received, and any connection errors.
*   **Console Errors:** Check the browser console for any JavaScript errors originating from the component or its dependencies.
*   **Callback Handlers:** Ensure your callback functions passed as props (`onTranscriptUpdate`, `onError`, etc.) are correctly defined and handle the data/errors appropriately.
*   **Mode Configuration:** If the wrong services are being initialized, verify that you're correctly including or omitting the `transcriptionOptions` and `agentOptions` props based on your needs.

## License

MIT 