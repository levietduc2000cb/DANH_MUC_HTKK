const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "Catalogue_DM_thue_BVMT_012027.xml");
const outputCsvPath = path.join(__dirname, "Catalogue_DM_thue_BVMT_012027_export.csv");
const outputXlsPath = path.join(__dirname, "Catalogue_DM_thue_BVMT_012027_export.xls");

const COL_MA = "Mã chỉ tiêu";
const COL_TEN = "Tên";
const COL_DVT = "Đơn vị tính";
const COL_GIA =
  "Giá tính thuế tài nguyên/mức thuế hoặc phí BVMT";

function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Parse chuỗi dạng ma###ten###dvt###mức (có thể thiếu dvt: nhiều ### liên tiếp) */
function parseItemValue(raw) {
  const value = decodeXmlEntities((raw ?? "").trim());
  const parts = value.split("###");
  if (parts.length < 2) {
    return { ma: value, ten: "", dvt: "", muc: "" };
  }
  const ma = parts[0];
  const muc = parts.length >= 2 ? parts[parts.length - 1] : "";
  const ten = parts[1] ?? "";
  const dvt = parts
    .slice(2, -1)
    .filter((s) => s.length > 0)
    .join("###");
  return { ma, ten, dvt, muc };
}

function parseItems(xml) {
  const rows = [];
  const re = /<Item[^>]*Value\s*=\s*"([^"]*)"[^>]*\/?>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    rows.push(parseItemValue(m[1]));
  }
  return rows;
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
  const header = [COL_MA, COL_TEN, COL_DVT, COL_GIA];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsv(r.ma),
        escapeCsv(r.ten),
        escapeCsv(r.dvt),
        escapeCsv(r.muc),
      ].join(",")
    );
  }
  return "\uFEFF" + lines.join("\r\n");
}

function buildExcelHtml(rows) {
  const th = `<tr><th>${escapeHtml(COL_MA)}</th><th>${escapeHtml(
    COL_TEN
  )}</th><th>${escapeHtml(COL_DVT)}</th><th>${escapeHtml(COL_GIA)}</th></tr>`;
  const body = rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.ma)}</td><td>${escapeHtml(
          r.ten
        )}</td><td>${escapeHtml(r.dvt)}</td><td>${escapeHtml(r.muc)}</td></tr>`
    )
    .join("\n");

  return [
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">',
    "<head>",
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
    "</head>",
    "<body>",
    '<table border="1">',
    th,
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

  console.log(`Nguồn: ${inputPath}`);
  console.log(`Đã tạo: ${outputCsvPath}`);
  console.log(`Đã tạo: ${outputXlsPath}`);
  console.log(`Số item: ${rows.length}`);

  const sample = rows.find((r) => r.ma === "010201");
  if (sample) {
    console.log("Ví dụ 010201:", sample);
  }
}

main();
