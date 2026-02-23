/**
 * ProductCard — review / recommendation block.
 *
 * Renders a product card with image, title, description, rating,
 * price, and affiliate link. Designed for product reviews and
 * recommendation lists.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface ProductCardAttrs {
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: string;
  currency: string;
  affiliateUrl: string;
  buttonLabel: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    productCard: {
      setProductCard: (attrs?: Partial<ProductCardAttrs>) => ReturnType;
    };
  }
}

export const ProductCardExtension = Node.create<Record<string, never>>({
  name: "productCard",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      title: { default: "" },
      description: { default: "" },
      imageUrl: { default: "" },
      rating: { default: 0 },
      price: { default: "" },
      currency: { default: "USD" },
      affiliateUrl: { default: "" },
      buttonLabel: { default: "Buy Now" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='product-card']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as ProductCardAttrs;
    const children: Array<
      [string, Record<string, string>, ...(string | [string, Record<string, string>, string])[]]
    > = [];

    if (attrs.imageUrl) {
      children.push(["img", { src: attrs.imageUrl, alt: attrs.title, class: "product-card-image" }]);
    }
    children.push(["h4", { class: "product-card-title" }, attrs.title]);
    if (attrs.description) {
      children.push(["p", { class: "product-card-description" }, attrs.description]);
    }
    if (attrs.rating > 0) {
      children.push(["span", { class: "product-card-rating" }, renderStars(attrs.rating)]);
    }
    if (attrs.price) {
      children.push(["span", { class: "product-card-price" }, `${attrs.currency} ${attrs.price}`]);
    }
    if (attrs.affiliateUrl) {
      children.push([
        "a",
        {
          href: attrs.affiliateUrl,
          class: "product-card-button",
          target: "_blank",
          rel: "noopener noreferrer sponsored",
        },
        attrs.buttonLabel,
      ]);
    }

    return [
      "div",
      mergeAttributes({
        "data-type": "product-card",
        class: "product-card",
      }),
      ...children,
    ];
  },

  addCommands() {
    return {
      setProductCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

export function renderProductCard(attrs: ProductCardAttrs): string {
  let html = `<div data-type="product-card" class="product-card">`;

  if (attrs.imageUrl) {
    html += `<img src="${esc(attrs.imageUrl)}" alt="${esc(attrs.title)}" class="product-card-image" />`;
  }

  html += `<h4 class="product-card-title">${escHtml(attrs.title)}</h4>`;

  if (attrs.description) {
    html += `<p class="product-card-description">${escHtml(attrs.description)}</p>`;
  }

  if (attrs.rating > 0) {
    html += `<span class="product-card-rating">${renderStars(attrs.rating)}</span>`;
  }

  if (attrs.price) {
    html += `<span class="product-card-price">${escHtml(attrs.currency)} ${escHtml(attrs.price)}</span>`;
  }

  if (attrs.affiliateUrl) {
    html += `<a href="${esc(attrs.affiliateUrl)}" class="product-card-button" target="_blank" rel="noopener noreferrer sponsored">${escHtml(attrs.buttonLabel)}</a>`;
  }

  html += `</div>`;
  return html;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
