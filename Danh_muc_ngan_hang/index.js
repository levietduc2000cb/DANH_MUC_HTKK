const fs = require("fs");
const path = require("path");
const inputPath = path.join(__dirname, "DM_NganHang_Moi.xml");
const outputPath = path.join(__dirname, "DM_NganHang_Moi.json");
function decodeXmlEntities(value) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
/**
 * Mỗi dòng: <Item Ma="..." Ten="..."/>
 * Ten có thể chứa &amp; trong XML.
 */
function parseItems(xml) {
  const rows = [];
  const re = /<Item\s+Ma="([^"]*)"\s+Ten="([^"]*)"\s*\/>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const ma = m[1].trim();
    const ten = decodeXmlEntities(m[2].trim());
    rows.push({
      data: ma,
      value: ten,
      name: ten,
    });
  }
  return rows;
}
function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Không tìm thấy: ${inputPath}`);
  }
  const xml = fs.readFileSync(inputPath, "utf8");
  const list = parseItems(xml);
  fs.writeFileSync(outputPath, JSON.stringify(list, null, 2), "utf8");
  console.log(`Đã ghi ${list.length} bản ghi → ${outputPath}`);
}
main();