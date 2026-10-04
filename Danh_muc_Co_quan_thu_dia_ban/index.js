/**
 * Đọc Catalogue_CQThu_Dia_Ban.xml → sinh Catalogue_CQThu_Dia_Ban_map.js
 * Object: key = MaXa, value = { MaCQThu, TenCQThu }
 */
const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "Catalogue_CQThu_Dia_Ban.xml");
const outputPath = path.join(__dirname, "Catalogue_CQThu_Dia_Ban_map.js");
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
    const maCQThu = (attrs.match(/MaCQThu\s*=\s*"([^"]*)"/i) || [])[1] ?? "";
    const tenCQThu = (attrs.match(/TenCQThu\s*=\s*"([^"]*)"/i) || [])[1] ?? "";
    const line = lineNumberAt(xml, m.index);
    rows.push({ maXa, maCQThu, tenCQThu, line });
  }
  return rows;
}

function buildMap(items) {
  const map = Object.create(null);
  /** @type {Record<string, { line: number, maCQThu: string, tenCQThu: string }>} */
  const last = Object.create(null);
  const reports = [];

  for (const { maXa, maCQThu, tenCQThu, line } of items) {
    const entry = { MaCQThu: maCQThu, TenCQThu: tenCQThu };
    if (maXa in map) {
      const prev = last[maXa];
      reports.push(
        `MaXa "${maXa}": dòng ${prev.line} (MaCQThu "${prev.maCQThu}") bị ghi đè bởi dòng ${line} (MaCQThu "${maCQThu}") — giữ bản sau cùng`
      );
    }
    map[maXa] = entry;
    last[maXa] = { line, maCQThu, tenCQThu };
  }

  if (reports.length > 0) {
    console.warn(
      `Cảnh báo: ${reports.length} lần trùng MaXa trong ${inputBasename} (giữ dòng sau cùng). Chi tiết:`
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
    " * Map MaXa → { MaCQThu, TenCQThu } — sinh từ Catalogue_CQThu_Dia_Ban.xml.",
    " * Chạy lại: node generate_Catalogue_CQThu_Dia_Ban_map.js",
    " */",
    `module.exports = ${json};`,
    "",
  ].join("\n");
  fs.writeFileSync(outputPath, body, "utf8");
  console.log(`Đã ghi ${Object.keys(map).length} MaXa → ${outputPath}`);
}

main();
