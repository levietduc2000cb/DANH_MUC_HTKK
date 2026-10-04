const fs = require("fs");
const path = require("path");
const inputPath = path.join(__dirname, "Catalogue_BVMT_072023.xml");
const outputCsvPath = path.join(__dirname, "Catalogue_BVMT_072023_export.csv");
const outputXlsPath = path.join(__dirname, "Catalogue_BVMT_072023_export.xls");
const COL_MA = "Mã chỉ tiêu";
const COL_TEN = "Tên";
const COL_DVT = "Đơn vị tính";
const COL_GIA_MIN = "Giá tối thiểu";
const COL_GIA_MAX = "Giá tối đa";
/** Bỏ qua dòng có độ dài chuỗi mã ≤ 2 (nhóm cha như "01", "02"). */
const MIN_MA_LEN = 2;
function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
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
      ma: getTagValue(block, "ma"),
      ten: getTagValue(block, "ten"),
      dvt: getTagValue(block, "dvt"),
      giatoithieu: getTagValue(block, "giatoithieu"),
      giatoida: getTagValue(block, "giatoida"),
    };
  });
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
function buildCsv(rows) {
  const header = [COL_MA, COL_TEN, COL_DVT, COL_GIA_MIN, COL_GIA_MAX];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsv(r.ma),
        escapeCsv(r.ten),
        escapeCsv(r.dvt),
        escapeCsv(r.giatoithieu),
        escapeCsv(r.giatoida),
      ].join(",")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}
function buildExcelHtml(rows) {
  const body = rows
    .map(
      (r) =>
        `<tr><td style="mso-number-format:'\@';">${escapeHtml(r.ma)}</td><td>${escapeHtml(r.ten)}</td><td>${escapeHtml(
          r.dvt
        )}</td><td>${escapeHtml(r.giatoithieu)}</td><td>${escapeHtml(r.giatoida)}</td></tr>`
    )
    .join("\n");
  return [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">',
    "<head>",
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
    "</head>",
    "<body>",
    '<table border="1">',
    `<tr><th>${escapeHtml(COL_MA)}</th><th>${escapeHtml(COL_TEN)}</th><th>${escapeHtml(
      COL_DVT
    )}</th><th>${escapeHtml(COL_GIA_MIN)}</th><th>${escapeHtml(COL_GIA_MAX)}</th></tr>`,
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
  const all = parseItems(xml);
  const rows = all.filter((r) => r.ma.length > MIN_MA_LEN);
  fs.writeFileSync(outputCsvPath, buildCsv(rows), "utf8");
  fs.writeFileSync(outputXlsPath, buildExcelHtml(rows), "utf8");
  console.log(`Đã tạo: ${outputCsvPath}`);
  console.log(`Đã tạo: ${outputXlsPath}`);
  console.log(`Tổng <item>: ${all.length}, sau lọc mã (độ dài > ${MIN_MA_LEN}): ${rows.length}`);
}
main();