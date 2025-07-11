import { useEffect, useState, useRef } from "react";

interface ChatStreamingTextChunkProps {
  fullText: string;
  minInterval?: number;
  maxInterval?: number;
  onDone?: () => void;
}

function getRandomChunkLength() {
  // 25% chance to stream up to next sentence-ending punctuation, else 1-4 words
  return Math.random() < 0.25 ? "sentence" : Math.ceil(Math.random() * 4);
}

function splitWordsAndPunctuation(text: string) {
  // Splits into words, punctuation, and whitespace
  // e.g. ["Hello", ",", "world", "!", ...]
  return text.match(/[\w'-]+|[.,!?;:"()\[\]]|\s+/g) || [];
}

export function ChatStreamingTextChunk({
  fullText,
  minInterval = 60,
  maxInterval = 120,
  onDone,
}: ChatStreamingTextChunkProps) {
  const [displayed, setDisplayed] = useState("");
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!fullText) return setDisplayed("");
    const tokens = splitWordsAndPunctuation(fullText);
    let i = 0;

    function nextChunkIndex() {
      const chunkLength = getRandomChunkLength();
      if (chunkLength === "sentence") {
        // Go to next sentence-ending punctuation
        for (let j = i; j < tokens.length; j++) {
          if (/[.!?]/.test(tokens[j])) return j + 1;
        }
        return tokens.length;
      }
      // Otherwise, add 1–4 "words" (skip whitespace)
      let count = 0;
      let j = i;
      while (j < tokens.length && count < chunkLength) {
        if (!/^\s+$/.test(tokens[j])) count++;
        j++;
      }
      return j;
    }

    setDisplayed("");
    function tick() {
      const nextI = nextChunkIndex();
      setDisplayed(tokens.slice(0, nextI).join(""));
      i = nextI;
      if (i >= tokens.length) {
        if (onDone) onDone();
        return;
      }
      timer.current = setTimeout(
        tick,
        Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval
      );
    }

    timer.current = setTimeout(tick, minInterval);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fullText, minInterval, maxInterval, onDone]);

  return <span>{displayed}</span>;
}

