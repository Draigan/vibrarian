import * as React from "react";
import ChatTextArea from "./ChatTextArea";
import VoiceVisualizer from "./VoiceVisualizer";
import { cn } from "@/lib/utils";
import { ArrowUp, Square, Mic, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";

type ExtendedWindow = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

interface ChatInputProps {
  sendMessage: any;
  isLoading: boolean;
  stop: () => void;
}

export default function ChatInput({
  sendMessage,
  isLoading,
  stop,
}: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const discardRecordingRef = useRef(false);
  const activeMimeTypeRef = useRef<string>("audio/webm");

  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const { sessionId } = useChat();

  useEffect(() => {
    inputRef.current?.focus();
  }, [sessionId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasMediaRecorder =
      "MediaRecorder" in window &&
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia;
    setIsRecordingSupported(Boolean(hasMediaRecorder));

    return () => {
      discardRecordingRef.current = true;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      audioChunksRef.current = [];
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && isLoading) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading || isTranscribing || input.trim().length === 0) return;
    sendMessage(input);
    setInput("");
  }

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1] ?? "";
          resolve(base64);
        } else {
          reject(new Error("Unable to read audio data."));
        }
      };
      reader.onerror = () => reject(new Error("Unable to read audio data."));
      reader.readAsDataURL(blob);
    });

  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const samples = buffer.length;
    const dataSize = samples * blockAlign;
    const totalSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    let offset = 0;
    const writeString = (str: string) => {
      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(offset, str.charCodeAt(i));
        offset += 1;
      }
    };

    const writeUint32 = (value: number) => {
      view.setUint32(offset, value, true);
      offset += 4;
    };

    const writeUint16 = (value: number) => {
      view.setUint16(offset, value, true);
      offset += 2;
    };

    // RIFF chunk descriptor
    writeString("RIFF");
    writeUint32(totalSize - 8);
    writeString("WAVE");

    // fmt sub-chunk
    writeString("fmt ");
    writeUint32(16); // PCM chunk size
    writeUint16(format);
    writeUint16(numChannels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * blockAlign);
    writeUint16(blockAlign);
    writeUint16(bitDepth);

    // data sub-chunk
    writeString("data");
    writeUint32(dataSize);

    const interleaved = new Float32Array(samples * numChannels);
    for (let channel = 0; channel < numChannels; channel += 1) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < samples; i += 1) {
        interleaved[i * numChannels + channel] = channelData[i];
      }
    }

    const clampSample = (sample: number) => {
      const s = Math.max(-1, Math.min(1, sample));
      return s < 0 ? s * 0x8000 : s * 0x7fff;
    };

    for (let i = 0; i < interleaved.length; i += 1) {
      view.setInt16(offset, clampSample(interleaved[i]), true);
      offset += 2;
    }

    return arrayBuffer;
  };

  const convertBlobToWav = async (blob: Blob) => {
    if (typeof window === "undefined") {
      return { base64: await blobToBase64(blob), mimeType: blob.type };
    }

    const extendedWindow = window as ExtendedWindow;
    const AudioContextCtor =
      extendedWindow.AudioContext || extendedWindow.webkitAudioContext;

    if (!AudioContextCtor) {
      return { base64: await blobToBase64(blob), mimeType: blob.type };
    }

    const audioContext = new AudioContextCtor();

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(
        arrayBuffer.slice(0)
      );
      const wavArrayBuffer = audioBufferToWav(decodedBuffer);
      const wavBlob = new Blob([wavArrayBuffer], { type: "audio/wav" });
      const base64 = await blobToBase64(wavBlob);
      return { base64, mimeType: "audio/wav" };
    } catch (error) {
      console.warn("Fell back to original audio blob for transcription", error);
      const base64 = await blobToBase64(blob);
      return { base64, mimeType: blob.type || "audio/webm" };
    } finally {
      await audioContext.close();
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const { base64, mimeType } = await convertBlobToWav(blob);

      if (!base64) {
        throw new Error("Audio clip was empty.");
      }

      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          audio: base64,
          mimeType,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You need to be logged in to use voice input.");
        }
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Transcription failed.");
      }

      const data: { text?: string } = await response.json();
      const transcript = data.text?.trim();
      if (!transcript) return;

      setInput((prev) => {
        if (!prev) return transcript;
        const needsSpace = /\S$/.test(prev);
        return `${prev}${needsSpace ? " " : ""}${transcript}`;
      });
      inputRef.current?.focus();
    } catch (error) {
      console.error("Voice transcription failed", error);
      if (typeof window !== "undefined") {
        window.alert(
          error instanceof Error
            ? error.message
            : "We couldn't transcribe that clip. Please try again."
        );
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopActiveStream = () => {
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioStreamRef.current = null;
  };

  const startRecording = async () => {
    if (!isRecordingSupported || isRecording || isTranscribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const fallbackTypes = [
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const supportedType =
        typeof MediaRecorder !== "undefined" &&
        fallbackTypes.find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      activeMimeTypeRef.current =
        recorder.mimeType && recorder.mimeType.length > 0
          ? recorder.mimeType
          : supportedType || "audio/webm";

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error", event);
        discardRecordingRef.current = true;
        setIsRecording(false);
        audioChunksRef.current = [];
        stopActiveStream();
      };

      recorder.onstop = async () => {
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];
        stopActiveStream();
        mediaRecorderRef.current = null;
        const shouldDiscard = discardRecordingRef.current;
        discardRecordingRef.current = false;
        setIsRecording(false);

        if (shouldDiscard || chunks.length === 0) {
          return;
        }

        const clip = new Blob(chunks, { type: activeMimeTypeRef.current });
        await transcribeAudio(clip);
      };

      recorder.onstart = () => {
        setIsRecording(true);
        console.debug(
          "Voice recorder started with mime type:",
          activeMimeTypeRef.current
        );
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch (error) {
      console.error("Unable to access microphone", error);
      discardRecordingRef.current = true;
      setIsRecording(false);
      stopActiveStream();
      if (typeof window !== "undefined") {
        window.alert(
          "Your browser blocked microphone access. Please allow it to use voice input."
        );
      }
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch (error) {
        console.error("Failed to stop recording", error);
      }
    }
  };

  const handleMicClick = () => {
    if (isTranscribing) return;

    if (!isRecordingSupported) {
      if (typeof window !== "undefined") {
        window.alert(
          "Voice capture needs a browser with MediaRecorder support (Chrome, Edge, Firefox, or Safari)."
        );
      }
      return;
    }

    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  };

  const handleCancelRecording = () => {
    discardRecordingRef.current = true;
    stopRecording();
  };

  const handleConfirmRecording = () => {
    stopRecording();
  };

  const micTitle = !isRecordingSupported
    ? "Voice capture needs a browser with MediaRecorder support."
    : isTranscribing
      ? "Processing your clip…"
      : isRecording
        ? "Click to stop recording"
        : "Click to start recording";

  return (
    <form
      ref={formRef}
      onSubmit={handleOnSubmit}
      className="flex flex-col w-full p-3 gap-0"
    >
      <div className="relative w-full">
        <ChatTextArea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Vibrarian"
          rows={1}
          className={cn(
            "transition-opacity duration-200",
            isRecording && "opacity-0 pointer-events-none select-none"
          )}
        />
        <VoiceVisualizer
          stream={isRecording ? audioStreamRef.current : null}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
        />
      </div>
      <div className="flex justify-end gap-2 items-center">
        <button
          type="button"
          onClick={isRecording ? handleCancelRecording : handleMicClick}
          aria-label={
            isRecording ? "Cancel voice recording" : "Start voice recording"
          }
          aria-pressed={isRecording}
          aria-disabled={isTranscribing}
          title={isRecording ? "Cancel recording" : micTitle}
          className={cn(
            "p-2 rounded-full transition shadow border border-border text-muted-foreground cursor-pointer",
            isRecording && "bg-destructive text-destructive-foreground",
            isTranscribing && "opacity-50 cursor-default"
          )}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {!isLoading && !isRecording && (
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            className={cn(
              "bg-primary text-black p-2 rounded-full transition shadow",
              (isLoading || input.trim().length === 0 || isTranscribing) && "opacity-50"
            )}
            aria-label="Send"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {isLoading && (
          <button
            type="button"
            className="bg-primary text-black p-2 rounded-full transition shadow"
            aria-label="Stop"
            onClick={stop}
          >
            <div className="w-5 h-5 flex justify-center items-center">
              <Square className="w-4 h-4" fill="currentColor" />
            </div>
          </button>
        )}

        {isRecording && !isTranscribing && (
          <button
            type="button"
            onClick={handleConfirmRecording}
            className="bg-primary text-black p-2 rounded-full transition shadow"
            aria-label="Confirm recording"
          >
            <Check className="w-5 h-5" />
          </button>
        )}

      </div>
    </form>
  );
}
