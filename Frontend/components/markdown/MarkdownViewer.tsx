"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string | null | undefined;
  className?: string;
  emptyMessage?: string;
}

export function MarkdownViewer({
  content,
  className = "",
  emptyMessage = "No content provided.",
}: MarkdownViewerProps) {
  if (!content || content.trim() === "") {
    return (
      <div className={cn("text-gray-500 italic text-sm", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-headings:font-semibold",
        "prose-p:text-gray-700 dark:prose-p:text-gray-300",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-li:my-1",
        "prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded",
        "prose-pre:bg-gray-100 prose-pre:text-gray-800",
        "prose-a:text-blue-600 hover:prose-a:text-blue-800",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

