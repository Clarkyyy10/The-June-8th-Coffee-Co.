import type { jsPDF as JsPDFType } from "jspdf";

export type Cell = string | number;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: Cell) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportCSV(filename: string, headers: string[], rows: Cell[][]) {
  const lines = [headers, ...rows].map((r) => r.map(escapeCsv).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `${filename}.csv`);
}

/** Excel export via an HTML-table workbook that Excel opens natively. */
export function exportExcel(
  filename: string,
  title: string,
  headers: string[],
  rows: Cell[][]
) {
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`)
    .join("");
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8" /></head>
    <body>
      <h2>${title}</h2>
      <table border="1"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    </body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  triggerDownload(blob, `${filename}.xls`);
}

export async function exportPDF(
  filename: string,
  title: string,
  subtitle: string,
  headers: string[],
  rows: Cell[][]
) {
  // Load the PDF library lazily so it never runs during SSR.
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc: JsPDFType = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor("#3b2416");
  doc.text("The June 8th Coffee Co.", 14, 18);
  doc.setFontSize(13);
  doc.text(title, 14, 27);
  doc.setFontSize(9);
  doc.setTextColor("#7a6a58");
  doc.text(subtitle, 14, 33);

  autoTable(doc, {
    startY: 38,
    head: [headers],
    body: rows.map((r) => r.map((c) => String(c ?? ""))),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [91, 58, 33], textColor: [250, 246, 240] },
    alternateRowStyles: { fillColor: [250, 246, 240] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}
