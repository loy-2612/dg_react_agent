import { useRef, useState } from "react";
import {
  DeepgramVoiceInteractionHandle,
  LLMResponse,
  TranscriptResponse,
  VoiceAI,
} from "../../src";

const voiceConfig =
  "eyJhdXRoIjoiMzEyZGNlMDE5NWI2M2I3NDEwYmQwNjFkYWEyMTNlNGM0M2QyOWExZiIsInZvaWNlIjoiYXVyYS1hbmd1cy1lbiIsImdyZWV0aW5nIjoiSGVsbG8hIEknbSBhbiB2b2ljZSBhc3Npc3RhbnQgZnJvbSBBSXhCbG9jay4gSG93IGNhbiBJIGFzc2lzdCB5b3UgdG9kYXk/IiwibGFuZ3VhZ2UiOiJlbi1VUyIsInRoaW5rTW9kZWwiOiJncHQtNG8tbWluaSIsImxpc3Rlbk1vZGVsIjoibm92YS0zIiwiaW5zdHJ1Y3Rpb25zIjoiWW91IGFyZSBhIGhlbHBmdWwgdm9pY2UgYXNzaXN0YW50IGZyb20gQUl4QmxvY2suIEtlZXAgeW91ciByZXNwb25zZXMgY29uY2lzZSBhbmQgaW5mb3JtYXRpdmUuIiwidGhpbmtQcm92aWRlciI6Im9wZW5haSIsInByb3ZpZGVyIjp7ImJhc2VVcmwiOiJodHRwczovL2FwaS5vcGVuYWkuY29tIiwidG9rZW4iOiJCZWFyZXIgc2stcHJvai1RNWtxZUVjNnlHOVo5VFRHZ2VyQktpVzRoQk5jUGdYYzNxX3QyTGJOMWw0Ni1pc0xMU3Ffd19rNmthWVdOMWZwSXpNVkFVeVFnalQzQmxia0ZKcEdzMEtSYndfLUpYWmhDNE5waHNSTV8zWElCQ3VUM3NkaEI1TU9fZmZ6dkRjOXFESWdDZmQyaWg5WE9aaUhVQURDMXBkRDhTY0EifX0=";

export const VoiceAIWrap = () => {
  const deepgramRef = useRef<DeepgramVoiceInteractionHandle>(null);
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
