// components/ChatMessage.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User as UserIcon } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  // bubble styling (user vs bot)
  const bubbleClass = isUser
    ? "bg-background/90 text-foreground rounded-2xl rounded-br-md p-3 shadow-sm"
    : "bg-muted/60 text-foreground rounded-2xl rounded-bl-md p-3 shadow-sm";

  return (
    <div className={`flex gap-3 p-4 ${isUser ? "bg-background" : "bg-muted/50"}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-secondary"}>
          {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className={bubbleClass}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            // we intentionally DO NOT enable rehype-raw to avoid rendering untrusted HTML
            components={
              {
                p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-2 leading-relaxed text-sm" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-2 text-sm" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-2 text-sm" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                code: ({ inline, className, children, ...props }) =>
                  inline ? (
                    <code className="bg-slate-200 text-xs px-1 py-[0.12rem] rounded" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-slate-900 text-white text-sm p-3 rounded overflow-auto" {...props}>
                      <code>{children}</code>
                    </pre>
                  ),
                blockquote: ({ node, ...props }) => <blockquote className="border-l-2 pl-3 italic text-sm text-slate-600" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-lg font-semibold my-1" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base font-semibold my-1" {...props} />,
                table: ({ node, ...props }) => <table className="table-auto border-collapse border mb-2 text-sm" {...props} />,
                th: ({ node, ...props }) => <th className="border px-2 py-1 bg-slate-100 text-left" {...props} />,
                td: ({ node, ...props }) => <td className="border px-2 py-1" {...props} />,
              } as any
            }
          >
            {message || ""}
          </ReactMarkdown>
        </div>

        {timestamp && <div className="text-xs text-muted-foreground">{timestamp}</div>}
      </div>
    </div>
  );
};
