"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { Range } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  icon: string;
  description: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandList = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  SlashCommandListProps
>(function SlashCommandList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) return null;

  return (
    <div className="slash-command-menu">
      {items.map((item, index) => (
        <button
          key={item.title}
          className={`slash-command-item ${index === selectedIndex ? "is-selected" : ""}`}
          onClick={() => command(item)}
        >
          <span className="slash-command-item-icon">{item.icon}</span>
          <span>
            <span className="block font-medium leading-tight">
              {item.title}
            </span>
            <span className="block text-xs text-gray-400 leading-tight">
              {item.description}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
});
