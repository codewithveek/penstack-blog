/**
 * packages/core/src/content/renderer.ts
 *
 * Server-side Tiptap JSON → HTML renderer.
 *
 * Converts the prosemirror JSON document produced by Tiptap in the editor
 * into clean semantic HTML for public display on theme pages, RSS feeds,
 * and email newsletters.
 *
 * Per AGENTS.md §12: "The server-side HTML renderer must handle every
 * custom extension node type. If you add an extension, you must add its
 * renderer case."
 *
 * The renderer is framework-agnostic (no React dependency) and runs on
 * the server only — it is imported by PostService when publishing.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal Tiptap/ProseMirror JSON node shape */
interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
}

interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

interface TiptapDoc {
  type: "doc";
  content?: TiptapNode[];
}

// ---------------------------------------------------------------------------
// HTML escape helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// Mark rendering
// ---------------------------------------------------------------------------

function openMark(mark: TiptapMark): string {
  switch (mark.type) {
    case "bold":
      return "<strong>";
    case "italic":
      return "<em>";
    case "strike":
      return "<s>";
    case "underline":
      return "<u>";
    case "code":
      return "<code>";
    case "subscript":
      return "<sub>";
    case "superscript":
      return "<sup>";
    case "highlight": {
      const color = (mark.attrs?.["color"] as string | undefined) ?? "yellow";
      return `<mark data-color="${escapeAttr(color)}">`;
    }
    case "link": {
      const href = (mark.attrs?.["href"] as string | undefined) ?? "";
      const target = (mark.attrs?.["target"] as string | undefined) ?? "_blank";
      const rel = target === "_blank" ? ' rel="noopener noreferrer"' : "";
      return `<a href="${escapeAttr(href)}" target="${escapeAttr(target)}"${rel}>`;
    }
    case "textStyle": {
      const styles: string[] = [];
      if (mark.attrs?.["color"]) styles.push(`color: ${mark.attrs["color"]}`);
      if (mark.attrs?.["fontFamily"]) styles.push(`font-family: ${mark.attrs["fontFamily"]}`);
      if (mark.attrs?.["fontSize"]) styles.push(`font-size: ${mark.attrs["fontSize"]}`);
      return styles.length > 0 ? `<span style="${styles.join("; ")}">` : "<span>";
    }
    default:
      return "";
  }
}

function closeMark(mark: TiptapMark): string {
  switch (mark.type) {
    case "bold":
      return "</strong>";
    case "italic":
      return "</em>";
    case "strike":
      return "</s>";
    case "underline":
      return "</u>";
    case "code":
      return "</code>";
    case "subscript":
      return "</sub>";
    case "superscript":
      return "</sup>";
    case "highlight":
      return "</mark>";
    case "link":
      return "</a>";
    case "textStyle":
      return "</span>";
    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Text node rendering (with marks)
// ---------------------------------------------------------------------------

function renderText(node: TiptapNode): string {
  const text = escapeHtml(node.text ?? "");
  if (!node.marks || node.marks.length === 0) return text;

  let result = "";
  for (const mark of node.marks) {
    result += openMark(mark);
  }
  result += text;
  for (const mark of [...node.marks].reverse()) {
    result += closeMark(mark);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Node rendering
// ---------------------------------------------------------------------------

function renderChildren(nodes: TiptapNode[]): string {
  return nodes.map((n) => renderNode(n)).join("");
}

function getTextAlign(attrs: Record<string, unknown> | undefined): string {
  if (!attrs?.["textAlign"]) return "";
  return ` style="text-align: ${attrs["textAlign"]}"`;
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    // ── Text ──
    case "text":
      return renderText(node);

    // ── Block nodes ──
    case "paragraph": {
      const align = getTextAlign(node.attrs);
      const inner = node.content ? renderChildren(node.content) : "";
      return `<p${align}>${inner}</p>`;
    }

    case "heading": {
      const level = (node.attrs?.["level"] as number | undefined) ?? 2;
      const clampedLevel = Math.max(1, Math.min(6, level));
      const tag = `h${clampedLevel}`;
      const align = getTextAlign(node.attrs);
      const id = node.content
        ? node.content
            .map((n) => n.text ?? "")
            .join("")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
        : "";
      const idAttr = id ? ` id="${escapeAttr(id)}"` : "";
      const inner = node.content ? renderChildren(node.content) : "";
      return `<${tag}${idAttr}${align}>${inner}</${tag}>`;
    }

    case "blockquote": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<blockquote>${inner}</blockquote>`;
    }

    case "codeBlock": {
      const language = (node.attrs?.["language"] as string | undefined) ?? "";
      const langClass = language ? ` class="language-${escapeAttr(language)}"` : "";
      const inner = node.content ? renderChildren(node.content) : "";
      return `<pre><code${langClass}>${inner}</code></pre>`;
    }

    case "bulletList": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<ul>${inner}</ul>`;
    }

    case "orderedList": {
      const start = (node.attrs?.["start"] as number | undefined) ?? 1;
      const startAttr = start !== 1 ? ` start="${start}"` : "";
      const inner = node.content ? renderChildren(node.content) : "";
      return `<ol${startAttr}>${inner}</ol>`;
    }

    case "listItem": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<li>${inner}</li>`;
    }

    case "taskList": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<ul data-type="taskList">${inner}</ul>`;
    }

    case "taskItem": {
      const checked = node.attrs?.["checked"] === true;
      const inner = node.content ? renderChildren(node.content) : "";
      return `<li data-type="taskItem" data-checked="${checked}"><label><input type="checkbox"${checked ? " checked" : ""} disabled />${inner}</label></li>`;
    }

    case "horizontalRule":
      return "<hr />";

    case "hardBreak":
      return "<br />";

    // ── Image (standard Tiptap) ──
    case "image": {
      const src = (node.attrs?.["src"] as string | undefined) ?? "";
      const alt = (node.attrs?.["alt"] as string | undefined) ?? "";
      const title = (node.attrs?.["title"] as string | undefined) ?? "";
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${titleAttr} loading="lazy" decoding="async" />`;
    }

    // ── ImageBlock (custom extension) ──
    case "imageBlock": {
      const src = String(node.attrs?.["src"] ?? "");
      const alt = String(node.attrs?.["alt"] ?? "");
      const caption = String(node.attrs?.["caption"] ?? "");
      const width = node.attrs?.["width"] as number | null | undefined;
      const height = node.attrs?.["height"] as number | null | undefined;
      const fullWidth = node.attrs?.["fullWidth"] === true;
      const href = String(node.attrs?.["href"] ?? "");

      const imgTag = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${
        width ? ` width="${width}"` : ""
      }${height ? ` height="${height}"` : ""} loading="lazy" decoding="async" />`;

      const inner = href
        ? `<a href="${escapeAttr(href)}" rel="noopener noreferrer">${imgTag}</a>`
        : imgTag;

      const figcaptionTag = caption
        ? `<figcaption>${escapeHtml(caption)}</figcaption>`
        : "";

      return `<figure data-type="image-block"${
        fullWidth ? ' class="full-width"' : ""
      }>${inner}${figcaptionTag}</figure>`;
    }

    // ── Embed / iframe ──
    case "embed":
    case "iframe": {
      const src = String(node.attrs?.["src"] ?? "");
      const width = node.attrs?.["width"] ?? "100%";
      const height = node.attrs?.["height"] ?? 400;
      return `<div class="embed-container"><iframe src="${escapeAttr(src)}" width="${width}" height="${height}" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`;
    }

    // ── HTML block (raw html, sanitized at input) ──
    case "htmlBlock": {
      const html = String(node.attrs?.["html"] ?? "");
      // html was already sanitized with DOMPurify at storage time
      return `<div data-type="html-block">${html}</div>`;
    }

    // ── Table ──
    case "table": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<table>${inner}</table>`;
    }
    case "tableRow": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<tr>${inner}</tr>`;
    }
    case "tableHeader": {
      const inner = node.content ? renderChildren(node.content) : "";
      const colspan = (node.attrs?.["colspan"] as number | undefined) ?? 1;
      const rowspan = (node.attrs?.["rowspan"] as number | undefined) ?? 1;
      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : "";
      const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : "";
      return `<th${colspanAttr}${rowspanAttr}>${inner}</th>`;
    }
    case "tableCell": {
      const inner = node.content ? renderChildren(node.content) : "";
      const colspan = (node.attrs?.["colspan"] as number | undefined) ?? 1;
      const rowspan = (node.attrs?.["rowspan"] as number | undefined) ?? 1;
      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : "";
      const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : "";
      return `<td${colspanAttr}${rowspanAttr}>${inner}</td>`;
    }

    // ── Details / accordion ──
    case "details": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<details>${inner}</details>`;
    }
    case "detailsSummary": {
      const inner = node.content ? renderChildren(node.content) : "";
      return `<summary>${inner}</summary>`;
    }
    case "detailsContent": {
      const inner = node.content ? renderChildren(node.content) : "";
      return inner;
    }

    // ── Callout / aside ──
    case "callout": {
      const emoji = (node.attrs?.["emoji"] as string | undefined) ?? "💡";
      const inner = node.content ? renderChildren(node.content) : "";
      return `<aside class="callout" data-emoji="${escapeAttr(emoji)}"><span class="callout-emoji">${escapeHtml(emoji)}</span><div class="callout-content">${inner}</div></aside>`;
    }

    // ── Button ──
    case "button": {
      const href = String(node.attrs?.["href"] ?? "#");
      const label = String(node.attrs?.["label"] ?? "Click");
      const variant = String(node.attrs?.["variant"] ?? "primary");
      return `<a href="${escapeAttr(href)}" class="button button-${escapeAttr(variant)}" role="button">${escapeHtml(label)}</a>`;
    }

    // ── Bookmark / link card ──
    case "bookmark": {
      const url = String(node.attrs?.["url"] ?? "");
      const title = String(node.attrs?.["title"] ?? url);
      const description = String(node.attrs?.["description"] ?? "");
      const thumbnail = String(node.attrs?.["thumbnail"] ?? "");
      const publisher = String(node.attrs?.["publisher"] ?? "");

      return `<figure class="bookmark-card"><a href="${escapeAttr(url)}" rel="noopener noreferrer">` +
        (thumbnail ? `<img src="${escapeAttr(thumbnail)}" alt="" loading="lazy" />` : "") +
        `<figcaption>` +
        `<h4>${escapeHtml(title)}</h4>` +
        (description ? `<p>${escapeHtml(description)}</p>` : "") +
        (publisher ? `<span class="bookmark-publisher">${escapeHtml(publisher)}</span>` : "") +
        `</figcaption></a></figure>`;
    }

    // ── Gallery ──
    case "gallery": {
      const inner = node.content ? renderChildren(node.content) : "";
      const columns = (node.attrs?.["columns"] as number | undefined) ?? 3;
      return `<div class="gallery" data-columns="${columns}">${inner}</div>`;
    }

    // ── Toggle heading ──
    case "toggleHeading": {
      const level = (node.attrs?.["level"] as number | undefined) ?? 3;
      const inner = node.content ? renderChildren(node.content) : "";
      return `<details class="toggle-heading"><summary><h${level}>${inner}</h${level}></summary></details>`;
    }

    // ── Fallback: render children if any ──
    default: {
      if (node.content) return renderChildren(node.content);
      return "";
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a Tiptap JSON document to semantic HTML.
 *
 * @param doc - The Tiptap document JSON (stored in `posts.lexical` column)
 * @returns Clean HTML string ready for display in themes / RSS / email
 */
export function renderTiptapToHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";
  const typedDoc = doc as TiptapDoc;
  if (typedDoc.type !== "doc" || !typedDoc.content) return "";
  return renderChildren(typedDoc.content);
}
