/**
 * NewsletterBox — in-content subscribe CTA block.
 *
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface NewsletterBoxAttrs {
  heading: string;
  subtext: string;
  buttonLabel: string;
  newsletterSlug: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    newsletterBox: {
      setNewsletterBox: (attrs?: Partial<NewsletterBoxAttrs>) => ReturnType;
    };
  }
}

export const NewsletterBoxExtension = Node.create<Record<string, never>>({
  name: "newsletterBox",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      heading: { default: "Subscribe to our newsletter" },
      subtext: { default: "Get the latest posts delivered straight to your inbox." },
      buttonLabel: { default: "Subscribe" },
      newsletterSlug: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='newsletter-box']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as NewsletterBoxAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "newsletter-box",
        "data-newsletter-slug": attrs.newsletterSlug,
        class: "newsletter-box",
      }),
      ["h3", { class: "newsletter-box-heading" }, attrs.heading],
      ["p", { class: "newsletter-box-subtext" }, attrs.subtext],
      [
        "button",
        { class: "newsletter-box-button", type: "button" },
        attrs.buttonLabel,
      ],
    ];
  },

  addCommands() {
    return {
      setNewsletterBox:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export function renderNewsletterBox(attrs: NewsletterBoxAttrs): string {
  return `<div data-type="newsletter-box" data-newsletter-slug="${esc(attrs.newsletterSlug)}" class="newsletter-box">
  <h3 class="newsletter-box-heading">${escHtml(attrs.heading)}</h3>
  <p class="newsletter-box-subtext">${escHtml(attrs.subtext)}</p>
  <form class="newsletter-box-form" data-newsletter="${esc(attrs.newsletterSlug)}">
    <input type="email" placeholder="your@email.com" required />
    <button type="submit">${escHtml(attrs.buttonLabel)}</button>
  </form>
</div>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
