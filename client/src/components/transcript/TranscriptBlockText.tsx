import { useRef, useEffect } from "react";

export default function TranscriptBlockText({
  value,
  editing,
  onChange,
  onSave,
  onCancel,
}) {
  const textareaRef = useRef(null);

  // Auto-resize on value change
  useEffect(() => {
    if (!editing || !textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height
    textarea.style.height = textarea.scrollHeight + "px";
  }, [value, editing]);

  if (!editing) {
    return <div className="whitespace-pre-line">{value ?? "(No content)"}</div>;
  }
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
    >
      <textarea
        ref={textareaRef}
        className="
          w-full min-h-[60px] rounded
          border border-gray-200
          bg-background text-foreground
          px-2 py-1
          outline-none
          focus:outline-none focus:ring-0 focus:border-gray-200
          active:border-gray-200
          resize-none
          overflow-hidden
        "
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus
        style={{ boxShadow: "none" }}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 rounded border border-gray-200 bg-gray-100 text-gray-800 text-sm"
          style={{ boxShadow: "none" }}
        >
          Save
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border border-gray-200 bg-gray-100 text-gray-800 text-sm"
          style={{ boxShadow: "none" }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

