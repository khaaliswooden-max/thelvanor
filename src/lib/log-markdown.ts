import { Marked,TextRenderer } from "marked";

const escapeAttribute=(value: string) => value
  .replaceAll("&","&amp;")
  .replaceAll('"',"&quot;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;");

// Presentation only: give Markdown tables the same accessible mobile labels as the BOM.
export const logMarkdown=new Marked({
  renderer: {
    table({ header,rows }) {
      const labels=header.map((cell) => escapeAttribute(this.parser.parseInline(cell.tokens,new TextRenderer())));
      const headings=header.map((cell) => `<th role="columnheader" scope="col">${this.parser.parseInline(cell.tokens)}</th>`).join("");
      const body=rows.map((row) => `<tr role="row">${row.map((cell,i) => `<td role="cell" data-label="${labels[i]}">${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`).join("");
      return `<table role="table" class="data responsive-data"><thead role="rowgroup"><tr role="row">${headings}</tr></thead><tbody role="rowgroup">${body}</tbody></table>`;
    },
  },
});
