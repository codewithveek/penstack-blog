/**
 * TableBlock — Full table editor extension wrapper.
 *
 * Uses Tiptap's official @tiptap/extension-table, @tiptap/extension-table-row,
 * @tiptap/extension-table-header, and @tiptap/extension-table-cell packages
 * (already in deps). This file re-exports them as a single configured bundle
 * and provides the server-side renderer.
 */

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

/**
 * Pre-configured table extension bundle.
 * Import and spread these into the editor's extensions array.
 */
export const TableBlockExtensions = [
  Table.configure({
    resizable: true,
    lastColumnResizable: false,
    allowTableNodeSelection: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
];

/**
 * Server-side renderer for the table node.
 * Tiptap JSON stores tables as nested node structures so the content renderer
 * handles them recursively. This helper wraps the rendered table HTML in
 * a responsive container.
 */
export function renderTableBlock(innerHtml: string): string {
  return `<div class="table-block-wrapper"><table class="table-block">${innerHtml}</table></div>`;
}

export function renderTableRow(innerHtml: string): string {
  return `<tr>${innerHtml}</tr>`;
}

export function renderTableHeader(
  innerHtml: string,
  attrs: { colspan?: number; rowspan?: number }
): string {
  const colspanAttr = attrs.colspan && attrs.colspan > 1 ? ` colspan="${attrs.colspan}"` : "";
  const rowspanAttr = attrs.rowspan && attrs.rowspan > 1 ? ` rowspan="${attrs.rowspan}"` : "";
  return `<th${colspanAttr}${rowspanAttr}>${innerHtml}</th>`;
}

export function renderTableCell(
  innerHtml: string,
  attrs: { colspan?: number; rowspan?: number }
): string {
  const colspanAttr = attrs.colspan && attrs.colspan > 1 ? ` colspan="${attrs.colspan}"` : "";
  const rowspanAttr = attrs.rowspan && attrs.rowspan > 1 ? ` rowspan="${attrs.rowspan}"` : "";
  return `<td${colspanAttr}${rowspanAttr}>${innerHtml}</td>`;
}
