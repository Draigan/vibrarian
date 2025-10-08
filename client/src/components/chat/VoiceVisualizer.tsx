import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ExtendedWindow = Window &
  typeof globalThis & { webkitAudioContext?: typeof AudioContext };

interface VoiceVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isTranscribing: boolean;
}

export default function VoiceVisualizer({
  stream,
  isRecording,
  isTranscribing,
}: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.clearRect(0, 0, width, height);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    clearCanvas();
  }, [clearCanvas]);

  const teardown = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // ignore disconnect errors
      }
      sourceNodeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    dataArrayRef.current = null;
    clearCanvas();
  }, [clearCanvas]);

  useEffect(() => {
    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvas]);

  useEffect(() => {
    if (!isRecording || !stream) {
      teardown();
      return;
    }

    const extendedWindow = window as ExtendedWindow;
    const AudioContextCtor =
      extendedWindow.AudioContext || extendedWindow.webkitAudioContext;
    if (!AudioContextCtor) {
      teardown();
      return;
    }

    try {
      teardown();
      resizeCanvas();
      const audioContext = new AudioContextCtor();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceNodeRef.current = source;

      let currentAmplitude = 0;

      const draw = () => {
        if (
          !analyserRef.current ||
          !dataArrayRef.current ||
          !canvasRef.current
        ) {
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;

        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        const bufferLength = dataArrayRef.current.length;
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i += 1) {
          const amp = dataArrayRef.current[i] - 128;
          sumSquares += amp * amp;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        const target = Math.min(1, rms / 72);
        currentAmplitude += (target - currentAmplitude) * 0.08;
        const eased = Math.pow(currentAmplitude, 0.4);

        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = "rgba(14, 165, 233, 0.85)";
        ctx.shadowColor = "rgba(14, 165, 233, 0.3)";
        ctx.shadowBlur = 14;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i += 2) {
          const v = (dataArrayRef.current[i] - 128) / 128;
          const amplitude = Math.tanh(v * 2.5) * (0.44 + eased * 1.1);
          const y = height / 2 + amplitude * (height / 2);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth * 2;
        }

        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (error) {
      console.warn("Unable to start waveform visualization", error);
      teardown();
    }

    return () => teardown();
  }, [isRecording, stream, resizeCanvas, teardown]);

  useEffect(() => {
    if (!isRecording) {
      clearCanvas();
    }
  }, [isRecording, clearCanvas]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 rounded-md transition-opacity duration-200 overflow-hidden flex items-center justify-center",
        isRecording ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      {isTranscribing && (
        <div className="absolute bottom-2 right-3 text-xs text-muted-foreground flex items-center gap-1 bg-background/70 px-2 py-1 rounded-full">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Processing…</span>
        </div>
      )}
    </div>
  );
}
