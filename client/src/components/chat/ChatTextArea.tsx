/** components/chat/ChatTextArea.tsx
 *
 * Auto-resizing textarea for chat input.
 * - Expands vertically as user types.
 * - Clamped to maxPx with overflow scroll.
 * - Forwards ref so parent can call .focus().
 */

import { useRef, useImperativeHandle, useCallback, useLayoutEffect, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxPx?: number;
}

const ChatTextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, value, maxPx = 200, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(forwardedRef, () => innerRef.current as HTMLTextAreaElement, []);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;

      el.style.height = "0px";
      const next = Math.min(el.scrollHeight, maxPx);
      el.style.height = next + "px";
      el.style.overflowY = el.scrollHeight > maxPx ? "auto" : "hidden";
    }, [maxPx]);

    useLayoutEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      resize();
      el.addEventListener("input", resize);
      return () => el.removeEventListener("input", resize);
    }, [resize]);

    useLayoutEffect(() => {
      resize();
    }, [value, resize]);

    useEffect(() => {
      const handle = () => resize();
      window.addEventListener("resize", handle);
      return () => window.removeEventListener("resize", handle);
    }, [resize]);

    return (
      <div className="w-full">
        <textarea
          ref={innerRef}
          value={value}
          rows={1}
          data-slot="textarea"
          className={cn(
            `
            w-full
            bg-accent
            resize-none
            px-3 py-2 border-none outline-none
            focus:ring-0
            shadow-none
            min-h-[48px]
          `,
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

export default ChatTextArea;
