/**
 * Đọc Catalogue_DBHC_Dia_Ban.xml → sinh Catalogue_DBHC_Dia_Ban_map.js
 * Dạng object: key = MaXa, value = MaDBHC
 */
const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "Catalogue_DBHC_Dia_Ban.xml");
const outputPath = path.join(__dirname, "Catalogue_DBHC_Dia_Ban_map.js");

const inputBasename = path.basename(inputPath);

function lineNumberAt(xml, index) {
  return xml.slice(0, index).split("\n").length;
}

function parseItems(xml) {
  const rows = [];
  const re = /<Item\b([^/]*?)\/>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const attrs = m[1];
    const maXa = (attrs.match(/MaXa\s*=\s*"([^"]*)"/i) || [])[1] ?? "";
    const maDBHC = (attrs.match(/MaDBHC\s*=\s*"([^"]*)"/i) || [])[1] ?? "";
    const line = lineNumberAt(xml, m.index);
    rows.push({ maXa, maDBHC, line });
  }
  return rows;
}

/**
 * Ghi đè theo thứ tự file: mỗi lần trùng MaXa, giữ MaDBHC của dòng xuất hiện sau.
 * In rõ số dòng trong inputBasename (1-based, trùng với editor).
 */
function buildMap(items) {
  const map = Object.create(null);
  /** @type {Record<string, { line: number, maDBHC: string }>} */
  const last = Object.create(null);
  const reports = [];

  for (const { maXa, maDBHC, line } of items) {
    if (maXa in map) {
      const prev = last[maXa];
      reports.push(
        `MaXa "${maXa}": dòng ${prev.line} (MaDBHC "${prev.maDBHC}") bị ghi đè bởi dòng ${line} (MaDBHC "${maDBHC}") — trong file giữ "${maDBHC}"`
      );
    }
    map[maXa] = maDBHC;
    last[maXa] = { line, maDBHC };
  }

  if (reports.length > 0) {
    console.warn(
      `Cảnh báo: ${reports.length} lần trùng MaXa trong ${inputBasename} (giữ MaDBHC của dòng sau cùng). Chi tiết:`
    );
    for (const r of reports) console.warn(`  • ${r}`);
  }
  return map;
}

function main() {
  const xml = fs.readFileSync(inputPath, "utf8");
  const items = parseItems(xml);
  const map = buildMap(items);
  const json = JSON.stringify(map, null, 2);
  const body = [
    "/**",
    " * Map MaXa → MaDBHC (key = MaXa, value = MaDBHC).",
    " * Sinh từ Catalogue_DBHC_Dia_Ban.xml — chạy lại: node generate_Catalogue_DBHC_Dia_Ban_map.js",
    " */",
    `module.exports = ${json};`,
    "",
  ].join("\n");
  fs.writeFileSync(outputPath, body, "utf8");
  console.log(`Đã ghi ${Object.keys(map).length} key → ${outputPath}`);
}

main();
