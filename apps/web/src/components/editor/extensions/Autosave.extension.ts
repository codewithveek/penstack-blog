/**
 * Autosave Tiptap extension.
 *
 * Per AGENTS.md rules:
 * - Implemented as a custom Tiptap extension using `onUpdate` + debounce (2000ms default)
 * - Toggleable per user preference
 * - Only saves if content has changed since last save (deep equality check)
 * - Calls the provided `onSave` callback; caller is responsible for the API call
 */

import { Extension } from "@tiptap/core";
import { debounce } from "lodash-es";

export interface AutosaveOptions {
  /** Called with the current Tiptap JSON when a save should be triggered. */
  onSave: (content: object) => void;
  /** Debounce delay in milliseconds. Defaults to 2000. */
  delay: number;
  /** When false the extension silently does nothing. Defaults to true. */
  enabled: boolean;
}

export interface AutosaveStorage {
  lastSavedContent: string;
  enabled: boolean;
  // stored so it's created once and reused across onUpdate calls
  _debouncedSave: ReturnType<typeof debounce> | null;
}

export const AutosaveExtension = Extension.create<
  AutosaveOptions,
  AutosaveStorage
>({
  name: "autosave",

  addOptions() {
    return {
      onSave: () => undefined,
      delay: 2000,
      enabled: true,
    };
  },

  addStorage() {
    return {
      lastSavedContent: "",
      enabled: this.options.enabled,
      _debouncedSave: null,
    };
  },

  onCreate() {
    // Store the initial content so we don't fire on first load
    this.storage.lastSavedContent = JSON.stringify(this.editor.getJSON());
    this.storage.enabled = this.options.enabled;

    // Create the debounced save function once
    this.storage._debouncedSave = debounce(() => {
      const current = JSON.stringify(this.editor.getJSON());
      if (current === this.storage.lastSavedContent) return;
      this.storage.lastSavedContent = current;
      this.options.onSave(this.editor.getJSON());
    }, this.options.delay);
  },

  onUpdate() {
    if (!this.storage.enabled) return;
    this.storage._debouncedSave?.();
  },

  onDestroy() {
    this.storage._debouncedSave?.cancel();
  },
});
