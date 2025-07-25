import React, { useEffect, useMemo, useState } from "react";
import {
  AgentState,
  ConnectionState,
  DeepgramError,
  DeepgramVoiceInteractionHandle,
  LLMResponse,
  ServiceType,
  TranscriptResponse,
  UserMessageResponse,
} from "../../types";
import { ConfigData } from "../../types/voiceConfig";
import DeepgramVoiceInteraction from "../DeepgramVoiceInteraction";

const transformThinkProviderName = (providerName: string) => {
  const obj: any = {
    openai: "open_ai",
    anthropic: "anthropic",
    replicate: "replicate",
  };
  return obj[providerName];
};

type VoiceAIProps = {
  voiceConfig: string;
  onReady?: (isReady: boolean) => void;
  onTranscriptUpdate?: (transcriptData: TranscriptResponse) => void;
  onAgentUtterance?: (utterance: LLMResponse) => void;
  onUserMessage?: (message: UserMessageResponse) => void;
  onError?: (error: DeepgramError) => void;
  deepgramRef: React.RefObject<DeepgramVoiceInteractionHandle>;
  onAgentStateChange?: (state: AgentState) => void;
  onConnectionStateChange?: (
    service: ServiceType,
    state: ConnectionState
  ) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  debug?: boolean;
  sleepOptions?: {
    autoSleep?: boolean;
    timeout?: number;
    wakeWords?: string[];
  };
  onAgentAudioUpdate?: (data: ArrayBuffer) => void;
};

export const VoiceAI: React.FC<VoiceAIProps> = ({
  voiceConfig,
  onReady,
  onAgentUtterance,
  onTranscriptUpdate,
  onUserMessage,
  onError,
  deepgramRef,
  onAgentStateChange,
  onConnectionStateChange,
  onPlaybackStateChange,
  sleepOptions,
  onAgentAudioUpdate,
  debug = false,
}) => {
  const [configData, setConfigData] = useState<ConfigData>(new ConfigData());

  useEffect(() => {
    initConfigData();
  }, [voiceConfig]);

  const initConfigData = async () => {
    const resp = window.atob(voiceConfig);
    setConfigData(JSON.parse(resp));
  };

  const memoizedTranscriptionOptions = useMemo(() => {
    return {
      model: configData.listenModel,
      language: configData.language,
      smart_format: true,
      interim_results: true,
      diarize: true,
      channels: 1,
      keyterm: [
        "Casella",
        "Symbiosis",
        "Kerfuffle",
        "Supercalifragilisticexpialidocious",
      ],
    };
  }, [configData]);

  const memoizedAgentOptions = useMemo(
    () => ({
      language: configData.language,
      listenModel: configData.listenModel,
      thinkProviderType: transformThinkProviderName(configData.thinkModel),
      thinkModel: configData.thinkModel,
      thinkApiKey: configData.provider.token,
      voice: configData.voice,
      instructions: configData.instructions,
      greeting: configData.greeting,
    }),
    [configData]
  );

  const memoizedEndpointConfig = useMemo(
    () => ({
      transcriptionUrl: "wss://api.deepgram.com/v1/listen",
      agentUrl: "wss://agent.deepgram.com/v1/agent/converse",
    }),
    []
  );

  return (
    <>
      <DeepgramVoiceInteraction
        ref={deepgramRef}
        apiKey={configData.auth}
        transcriptionOptions={memoizedTranscriptionOptions}
        agentOptions={memoizedAgentOptions}
        endpointConfig={memoizedEndpointConfig}
        onReady={onReady}
        onTranscriptUpdate={onTranscriptUpdate}
        onAgentUtterance={onAgentUtterance}
        onUserMessage={onUserMessage}
        onAgentStateChange={onAgentStateChange}
        onConnectionStateChange={onConnectionStateChange}
        onError={onError}
        onPlaybackStateChange={onPlaybackStateChange}
        debug={debug}
        sleepOptions={sleepOptions}
        onAgentAudioUpdate={onAgentAudioUpdate}
      />
    </>
  );
};
