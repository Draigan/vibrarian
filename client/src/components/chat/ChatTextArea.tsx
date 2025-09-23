import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef } from "react";

export default function ChatTextArea({
  className,
  value,
  ...props
}: React.ComponentProps<"textarea"> & { value: string }) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const MAX = 200; // px

  useLayoutEffect(() => {
    const ta = taRef.current;
    const wrap = wrapRef.current;
    if (!ta || !wrap) return;

    const resize = () => {
      ta.style.height = "auto";
      const h = Math.min(ta.scrollHeight, MAX);
      ta.style.height = `${h}px`;
      ta.style.overflowY = ta.scrollHeight > MAX ? "auto" : "hidden";
      wrap.style.height = `${h}px`;
    };

    resize();
    ta.addEventListener("input", resize);
    window.addEventListener("resize", resize);
    return () => {
      ta.removeEventListener("input", resize);
      window.removeEventListener("resize", resize);
    };
  }, [value]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <textarea
        ref={taRef}
        value={value}
        data-slot="textarea"
        className={cn(
          `
          absolute bottom-0 left-0 w-full
          bg-accent px-3 py-2
          border-none outline-none focus:ring-0
          resize-none min-h-[48px] max-h-[200px]
          overflow-y-auto
          relative z-10 pointer-events-auto
          !select-text selection:bg-primary/20
          `,
          className
        )}
        {...props}
      />
    </div>
  );
}

