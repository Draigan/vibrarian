import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatStreamingTextChunkProps {
  fullText: string;
  minInterval?: number;
  maxInterval?: number;
  onDone?: () => void;
  stream: boolean;
  id?: string;          // Unique per message, e.g. message.id
  hideDelay?: number;   // ms to hide on mount
}

// Helper: split and count words/punctuation/whitespace
function splitWordsAndPunctuation(text: string) {
  return text.match(/[\w'-]+|[.,!?;:"()\[\]]|\s+/g) || [];
}
function getRandomChunkLength() {
  return Math.random() < 0.25 ? "sentence" : Math.ceil(Math.random() * 4);
}

export function ChatStreamingTextChunk({
  fullText,
  minInterval = 60,
  maxInterval = 120,
  stream,
  onDone,
  id,
  hideDelay = 500,
}: ChatStreamingTextChunkProps) {
  const tokens = splitWordsAndPunctuation(fullText);

  // Unique key for THIS animation run (id + text)
  const runKey = (id || "") + "::" + fullText;

  // Track what we have streamed already (session-persistent, not just for this render!)
  const everStreamedRef = useRef<Record<string, boolean>>({});
  const [visibleLen, setVisibleLen] = useState(
    (stream && !everStreamedRef.current[runKey]) ? 0 : tokens.length
  );
  const [hidden, setHidden] = useState((stream && !everStreamedRef.current[runKey]));
  const timer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Only animate if this message hasn't ever streamed before
  useEffect(() => {
    if (!stream || !fullText || everStreamedRef.current[runKey]) {
      setVisibleLen(tokens.length);
      setHidden(false);
      if (onDone && !everStreamedRef.current[runKey]) onDone();
      everStreamedRef.current[runKey] = true;
      return;
    }

    // Animation hasn't run yet for this id+content!
    setVisibleLen(0);
    setHidden(true);

    hideTimer.current = setTimeout(() => {
      setHidden(false);
      let i = 0;

      function nextChunkIndex() {
        const chunkLength = getRandomChunkLength();
        if (chunkLength === "sentence") {
          for (let j = i; j < tokens.length; j++) {
            if (/[.!?]/.test(tokens[j])) return j + 1;
          }
          return tokens.length;
        }
        let count = 0, j = i;
        while (j < tokens.length && count < chunkLength) {
          if (!/^\s+$/.test(tokens[j])) count++;
          j++;
        }
        return j;
      }

      function tick() {
        const nextI = nextChunkIndex();
        setVisibleLen(nextI);
        i = nextI;
        if (i >= tokens.length) {
          everStreamedRef.current[runKey] = true;
          if (onDone) onDone();
          return;
        }
        timer.current = setTimeout(
          tick,
          Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval
        );
      }
      timer.current = setTimeout(tick, minInterval);
    }, hideDelay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  // Only rerun if runKey or stream changes!
  }, [runKey, stream, minInterval, maxInterval, hideDelay, onDone, fullText, tokens.length]);

  const revealed = fullText.slice(0, tokens.slice(0, visibleLen).join("").length);

  return (
    <span
      className="relative block w-full"
      aria-live="polite"
      style={{
        minHeight: "1.2em",
        visibility: hidden ? "hidden" : "visible",
        transition: "visibility 0s",
        paddingBottom: "1em"
      }}
    >
      <span className="opacity-0 select-none">{fullText}</span>
      <span
        className="absolute inset-0 left-0 top-0 pointer-events-none w-full h-full block"
        style={{ color: "inherit" }}
        aria-hidden="true"
      >
        <ReactMarkdown>{revealed}</ReactMarkdown>
      </span>
    </span>
  );
}

