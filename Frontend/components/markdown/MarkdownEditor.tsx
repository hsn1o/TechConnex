"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import { useState } from "react";
import { Label } from "@/components/ui/label";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  height?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder = "Write your markdown here...",
  height = 300,
  className = "",
}: MarkdownEditorProps) {
  const [data, setData] = useState(value || "");

  const handleChange = (val?: string) => {
    const newValue = val || "";
    setData(newValue);
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div data-color-mode="light">
        <MDEditor
          value={data}
          onChange={handleChange}
          preview="edit"
          hideToolbar={false}
          visibleDragBar={false}
          height={height}
          textareaProps={{
            placeholder,
            style: { fontSize: 14 },
          }}
        />
      </div>
    </div>
  );
}

