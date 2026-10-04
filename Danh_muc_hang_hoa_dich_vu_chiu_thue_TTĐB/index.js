const fs = require("fs");
const path = require("path");
const inputPath = path.join(__dirname, "Catalogue_032027_02.xml");
const outputCsvPath = path.join(__dirname, "Catalogue_032027_02_export.csv");
const outputXlsPath = path.join(__dirname, "Catalogue_032027_02_export.xls");
function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
function escapeCsv(value) {
  const v = (value ?? "").toString();
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
function escapeHtml(value) {
  return (value ?? "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function getTagValue(block, tagName) {
  const re = new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const m = block.match(re);
  return m ? decodeXmlEntities(m[1].trim()) : "";
}
function parseItems(xmlText) {
  const itemMatches = [...xmlText.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  return itemMatches.map((m) => {
    const block = m[1];
    return {
      ten: getTagValue(block, "ten"),
      thuesuat: getTagValue(block, "thuesuat"),
      dvt: getTagValue(block, "dvt"),
    };
  });
}
function buildCsv(rows) {
  const header = ["ten", "thuesuat", "dvt"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([escapeCsv(r.ten), escapeCsv(r.thuesuat), escapeCsv(r.dvt)].join(","));
  }
  // BOM để Excel hiển thị tiếng Việt đúng.
  return "\uFEFF" + lines.join("\r\n");
}
function buildExcelHtml(rows) {
  const body = rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.ten)}</td><td>${escapeHtml(r.thuesuat)}</td><td>${escapeHtml(
          r.dvt
        )}</td></tr>`
    )
    .join("\n");
  return [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">',
    "<head>",
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
    "<!-- Excel mở trực tiếp được file HTML có đuôi .xls -->",
    "</head>",
    "<body>",
    '<table border="1">',
    "<tr><th>ten</th><th>thuesuat</th><th>dvt</th></tr>",
    body,
    "</table>",
    "</body>",
    "</html>",
  ].join("\n");
}
function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Không tìm thấy file: ${inputPath}`);
  }
  const xml = fs.readFileSync(inputPath, "utf8");
  const rows = parseItems(xml);
  fs.writeFileSync(outputCsvPath, buildCsv(rows), "utf8");
  fs.writeFileSync(outputXlsPath, buildExcelHtml(rows), "utf8");
  console.log(`Đã tạo: ${outputCsvPath}`);
  console.log(`Đã tạo: ${outputXlsPath}`);
  console.log(`Tổng số dòng dữ liệu: ${rows.length}`);
}
main();