import { cn } from "@/lib/utils";

export default function ChatTextArea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `
          flex-1 bg-accent min-h-[48px] resize-none px-3 py-2 border-none outline-none
          focus:ring-0 focus:outline-none focus:border-none
          hover:ring-0 hover:outline-none hover:border-none
          shadow-none
          selection:bg-transparent selection:text-inherit
        `,
        className
      )}
      {...props}
    />
  );
}

